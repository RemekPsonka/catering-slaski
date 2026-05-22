import { MedusaService } from "@medusajs/framework/utils"
import { MedusaContainer } from "@medusajs/framework/types"
import { Queue, Worker, QueueEvents } from "bullmq"
import crypto from "crypto"
import axios from "axios"

type WebhookDestination = "production" | "logistics" | "billing"

type WebhookConfig = {
  url: string
  secret: string
}

type ModuleOptions = {
  production: WebhookConfig
  logistics: WebhookConfig
  billing: WebhookConfig
}

type DispatchInput = {
  destination: WebhookDestination
  event_id: string
  event_type: string
  payload: Record<string, any>
}

const QUEUE_NAME = "external_webhooks"
const MAX_ATTEMPTS = 7

// Exponential backoff: 1s, 5s, 30s, 5m, 30m, 2h, 12h
const BACKOFF_MS = [1000, 5000, 30000, 300000, 1800000, 7200000, 43200000]

/**
 * External Webhooks Service
 *
 * Wysyła zdarzenia do 3 zewnętrznych systemów (produkcja, logistyka, rozliczenia)
 * z:
 *  - HMAC-SHA256 signature
 *  - Idempotency-Key = event_id
 *  - Exponential backoff retry (7 prób)
 *  - Dead Letter Queue dla nieudanych
 *  - Persistencja w webhook_deliveries dla audit
 *
 * Wywołanie: subscribers/order-placed-production.ts itd. wołają dispatch()
 */
export default class ExternalWebhooksService extends MedusaService({}) {
  private options_: ModuleOptions
  private queue_: Queue | null = null
  private worker_: Worker | null = null
  private container_: MedusaContainer

  constructor(container: MedusaContainer, options: ModuleOptions) {
    super(...arguments)
    this.options_ = options
    this.container_ = container
    this.initQueue_()
  }

  async dispatch(input: DispatchInput): Promise<{ delivery_id: string }> {
    const config = this.options_[input.destination]
    if (!config?.url) {
      throw new Error(`No webhook URL configured for ${input.destination}`)
    }

    // Persist delivery record first
    const knex = this.getKnex_()
    const deliveryId = `wh_${crypto.randomUUID()}`

    await knex.raw(
      `
      INSERT INTO webhook_deliveries
        (id, event_id, destination, event_type, endpoint_url, payload_json, status)
      VALUES (?, ?, ?, ?, ?, ?::jsonb, 'queued')
      ON CONFLICT (event_id) DO NOTHING
      `,
      [
        deliveryId,
        input.event_id,
        input.destination,
        input.event_type,
        config.url,
        JSON.stringify(input.payload),
      ]
    )

    // Enqueue job (only if queue is initialized — requires REDIS_URL)
    if (!this.queue_) {
      console.warn(`[external-webhooks] queue disabled — webhook ${input.event_id} not enqueued (set REDIS_URL to enable retry queue)`)
      return { delivery_id: deliveryId, enqueued: false }
    }
    await this.queue_!.add(
      `${input.destination}:${input.event_type}`,
      {
        delivery_id: deliveryId,
        event_id: input.event_id,
        destination: input.destination,
        event_type: input.event_type,
        payload: input.payload,
      },
      {
        jobId: input.event_id,  // BullMQ dedupe
        attempts: MAX_ATTEMPTS,
        backoff: {
          type: "custom",
        },
      }
    )

    return { delivery_id: deliveryId }
  }

  /**
   * Internal: actually performs the HTTP POST.
   * Called by BullMQ worker.
   */
  private async sendWebhook_(job: any): Promise<void> {
    const { delivery_id, event_id, destination, event_type, payload } = job.data
    const config = this.options_[destination as WebhookDestination]

    const body = JSON.stringify(payload)
    const signature = this.computeSignature_(body, config.secret)

    const knex = this.getKnex_()
    const attemptNo = job.attemptsMade + 1

    try {
      const response = await axios.post(config.url, payload, {
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Signature": `sha256=${signature}`,
          "X-Idempotency-Key": event_id,
          "X-Webhook-Version": "1",
          "User-Agent": "CateringSlaski-Webhooks/1.0",
        },
        timeout: 10000,  // 10s
        validateStatus: () => true,  // we handle status manually
      })

      if (response.status >= 200 && response.status < 300) {
        // Success
        await knex.raw(
          `UPDATE webhook_deliveries
           SET status = 'delivered',
               attempts = ?,
               last_attempt_at = now(),
               delivered_at = now(),
               last_status_code = ?,
               last_error = NULL
           WHERE id = ?`,
          [attemptNo, response.status, delivery_id]
        )
        return
      }

      if (response.status === 409) {
        // Idempotency hit — treat as success
        await knex.raw(
          `UPDATE webhook_deliveries
           SET status = 'delivered',
               attempts = ?,
               last_attempt_at = now(),
               last_status_code = ?,
               last_error = 'duplicate (409 idempotency)'
           WHERE id = ?`,
          [attemptNo, response.status, delivery_id]
        )
        return
      }

      // Permanent error: 4xx (not 429)
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        await knex.raw(
          `UPDATE webhook_deliveries
           SET status = 'dead_letter',
               attempts = ?,
               last_attempt_at = now(),
               last_status_code = ?,
               last_error = ?
           WHERE id = ?`,
          [attemptNo, response.status, `4xx error: ${response.statusText}`, delivery_id]
        )
        await this.moveToDeadLetter_(delivery_id, `4xx error: ${response.status}`)
        throw new Error(`Permanent failure: ${response.status}`)
      }

      // 5xx or 429 — retry
      await knex.raw(
        `UPDATE webhook_deliveries
         SET status = 'failed_retry',
             attempts = ?,
             last_attempt_at = now(),
             last_status_code = ?,
             last_error = ?,
             next_retry_at = now() + INTERVAL '${BACKOFF_MS[Math.min(attemptNo, BACKOFF_MS.length - 1)]} milliseconds'
         WHERE id = ?`,
        [attemptNo, response.status, `${response.status} ${response.statusText}`, delivery_id]
      )

      throw new Error(`Retry needed: ${response.status}`)
    } catch (err: any) {
      // Network error, timeout, etc. — retry
      await knex.raw(
        `UPDATE webhook_deliveries
         SET status = 'failed_retry',
             attempts = ?,
             last_attempt_at = now(),
             last_error = ?
         WHERE id = ?`,
        [attemptNo, err.message?.substring(0, 500) || "Unknown error", delivery_id]
      )

      // If max attempts reached, move to DLQ
      if (attemptNo >= MAX_ATTEMPTS) {
        await this.moveToDeadLetter_(delivery_id, err.message || "Max attempts reached")
      }

      throw err
    }
  }

  private async moveToDeadLetter_(deliveryId: string, lastError: string): Promise<void> {
    const knex = this.getKnex_()
    await knex.raw(
      `
      INSERT INTO webhook_dead_letters
        (webhook_delivery_id, destination, payload_json, last_error, attempts)
      SELECT id, destination, payload_json, ?, attempts
      FROM webhook_deliveries
      WHERE id = ?
      `,
      [lastError, deliveryId]
    )
    await knex.raw(
      `UPDATE webhook_deliveries SET status = 'dead_letter' WHERE id = ?`,
      [deliveryId]
    )

    // TODO: send Slack alert + email to ops
    console.error(`[webhooks] DLQ entry created for delivery ${deliveryId}: ${lastError}`)
  }

  /**
   * Verify incoming webhook signature (from external systems → us).
   */
  verifyIncomingSignature(rawBody: string, providedSignature: string, secret: string): boolean {
    const expected = this.computeSignature_(rawBody, secret)
    const provided = providedSignature.replace(/^sha256=/, "")
    try {
      return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(provided))
    } catch {
      return false
    }
  }

  /**
   * Admin: manual re-fire from DLQ.
   */
  async retryDeadLetter(dlqId: string): Promise<void> {
    const knex = this.getKnex_()
    const result = await knex.raw(
      `SELECT * FROM webhook_dead_letters WHERE id = ?`,
      [dlqId]
    )
    const dlq = result.rows[0]
    if (!dlq) throw new Error("DLQ entry not found")

    await this.dispatch({
      destination: dlq.destination as WebhookDestination,
      event_id: `retry_${dlqId}_${Date.now()}`,
      event_type: "manual_retry",
      payload: dlq.payload_json,
    })

    await knex.raw(
      `UPDATE webhook_dead_letters SET resolved_at = now() WHERE id = ?`,
      [dlqId]
    )
  }

  private computeSignature_(body: string, secret: string): string {
    return crypto.createHmac("sha256", secret).update(body).digest("hex")
  }

  private initQueue_(): void {
    if (!process.env.REDIS_URL) {
      console.warn("[external-webhooks] REDIS_URL not set — queue+worker disabled (webhooks will be sent inline, no retry queue)")
      return
    }
    const redisUrl = process.env.REDIS_URL

    this.queue_ = new Queue(QUEUE_NAME, {
      connection: { url: redisUrl } as any,
      defaultJobOptions: {
        removeOnComplete: { count: 1000, age: 86400 },  // 1 day
        removeOnFail: { count: 5000, age: 604800 },  // 7 days
      },
    })

    // Worker — only initialize in "worker" or "shared" mode
    const workerMode = process.env.MEDUSA_WORKER_MODE
    if (workerMode === "server") return  // server mode = no worker

    this.worker_ = new Worker(
      QUEUE_NAME,
      async (job) => this.sendWebhook_(job),
      {
        connection: { url: redisUrl } as any,
        concurrency: 5,
        settings: {
          backoffStrategy: (attemptsMade: number) => {
            return BACKOFF_MS[Math.min(attemptsMade, BACKOFF_MS.length - 1)]
          },
        } as any,
      }
    )

    this.worker_.on("failed", (job, err) => {
      console.error(`[webhooks] Job ${job?.id} failed: ${err.message}`)
    })
  }

  private getKnex_(): any {
    const manager = (this.container_ as any).manager ||
                    (this as any).manager_
    return manager.getConnection().getKnex()
  }
}
