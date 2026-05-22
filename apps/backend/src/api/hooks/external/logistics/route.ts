// @ts-nocheck
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { createHmac, timingSafeEqual } from "node:crypto"
import { z } from "zod"

/**
 * POST /hooks/external/logistics
 *
 * Webhook IN z logistyki (firma kurierska / własna flota):
 *   - courier_assigned: kurier+ETA gotowe → SMS do klienta
 *   - on_the_way: kurier 30 min od adresu → SMS ETA
 *   - delivered: dostarczone → emit order.completed
 *   - failed: nieudana dostawa → eskalacja
 *
 * Auth: HMAC-SHA256 jak production.
 * Idempotency: event_id.
 */

const PayloadSchema = z.object({
  event_id: z.string().min(1).max(100),
  order_id: z.string().min(1),
  status: z.enum(["courier_assigned", "on_the_way", "delivered", "failed", "rescheduled"]),
  courier: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
  }).optional(),
  eta_minutes: z.number().int().min(0).max(720).optional(),
  proof: z.object({
    photo_url: z.string().url().optional(),
    signature_url: z.string().url().optional(),
    recipient_name: z.string().optional(),
  }).optional(),
  failure_reason: z.string().max(500).optional(),
  occurred_at: z.string(),
})

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const secret = process.env.WEBHOOK_LOGISTICS_SECRET
  if (!secret) {
    return res.status(503).json({ error: "Not configured" })
  }

  const signature = req.headers["x-cs-signature"] as string
  if (!signature || !signature.startsWith("sha256=")) {
    return res.status(401).json({ error: "Missing or malformed signature" })
  }

  const rawBody = (req as any).rawBody || JSON.stringify(req.body)
  const expected = "sha256=" + createHmac("sha256", secret)
    .update(typeof rawBody === "string" ? rawBody : rawBody.toString("utf8"))
    .digest("hex")

  if (signature.length !== expected.length ||
      !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return res.status(401).json({ error: "Invalid signature" })
  }

  const parsed = PayloadSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() })
  }

  const { event_id, order_id, status } = parsed.data
  const logger = req.scope.resolve("logger") as any

  try {
    const knex = (req.scope as any).manager.getConnection().getKnex()

    const seen = await knex.raw(
      `SELECT event_id FROM cs.webhook_events_in WHERE event_id = ? AND source = 'logistics'`,
      [event_id]
    )
    if (seen.rows.length > 0) {
      return res.status(200).json({ ok: true, deduplicated: true })
    }

    await knex.raw(
      `INSERT INTO cs.webhook_events_in (event_id, source, order_id, status, payload, received_at)
       VALUES (?, 'logistics', ?, ?, ?::jsonb, NOW())`,
      [event_id, order_id, status, JSON.stringify(parsed.data)]
    )

    // Order metadata update
    const orderModule = req.scope.resolve(Modules.ORDER)
    try {
      const meta: Record<string, any> = {
        logistics_status: status,
        logistics_updated_at: parsed.data.occurred_at,
      }
      if (parsed.data.courier) meta.courier = parsed.data.courier
      if (parsed.data.eta_minutes !== undefined) meta.eta_minutes = parsed.data.eta_minutes
      if (parsed.data.proof) meta.delivery_proof = parsed.data.proof
      if (parsed.data.failure_reason) meta.delivery_failure_reason = parsed.data.failure_reason

      await orderModule.updateOrders([{ id: order_id, metadata: meta }])
    } catch (err) {
      logger.warn(`[webhook-in/logistics] Order ${order_id} update failed: ${(err as Error).message}`)
    }

    // Internal event — on "delivered" we'll trigger order.completed downstream
    const eventBus = req.scope.resolve(Modules.EVENT_BUS) as any
    await eventBus.emit({
      name: `logistics.${status}`,
      data: { order_id, ...parsed.data },
    })

    if (status === "delivered") {
      // Also emit order.completed for loyalty + review-request flows
      await eventBus.emit({ name: "order.completed", data: { id: order_id } })
    }

    logger.info(`[webhook-in/logistics] ${event_id} → order ${order_id} = ${status}`)

    return res.status(200).json({ ok: true })
  } catch (err) {
    logger.error(`[webhook-in/logistics] failed: ${(err as Error).message}`)
    return res.status(500).json({ error: "Internal error" })
  }
}
