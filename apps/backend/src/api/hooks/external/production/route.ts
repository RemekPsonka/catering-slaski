import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { createHmac, timingSafeEqual } from "node:crypto"
import { z } from "zod"

/**
 * POST /hooks/external/production
 *
 * Webhook IN z systemu produkcji ("KP" / kuchnia centralna).
 * Odbiera status_change: queued → in_production → ready_to_dispatch → dispatched.
 *
 * Auth: HMAC-SHA256 header `x-cs-signature: sha256=<hex>` ze WSPÓLNYM secretem
 * (env: WEBHOOK_PRODUCTION_SECRET — ten sam co używamy do wysyłania OUT, lustrzanie).
 *
 * Idempotency: event_id z payloadu — duplikat zwraca 200 OK bez side effects.
 */

const PayloadSchema = z.object({
  event_id: z.string().min(1).max(100),
  order_id: z.string().min(1),
  status: z.enum(["queued", "in_production", "ready_to_dispatch", "dispatched", "production_failed"]),
  message: z.string().max(500).optional(),
  occurred_at: z.string(), // ISO8601
})

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const secret = process.env.WEBHOOK_PRODUCTION_SECRET
  if (!secret) {
    console.error("[webhook-in/production] WEBHOOK_PRODUCTION_SECRET not configured")
    return res.status(503).json({ error: "Not configured" })
  }

  // Verify HMAC
  const signature = req.headers["x-cs-signature"] as string
  if (!signature || !signature.startsWith("sha256=")) {
    return res.status(401).json({ error: "Missing or malformed signature" })
  }

  const rawBody = (req as any).rawBody || JSON.stringify(req.body)
  const expected = "sha256=" + createHmac("sha256", secret)
    .update(typeof rawBody === "string" ? rawBody : rawBody.toString("utf8"))
    .digest("hex")

  // timingSafeEqual avoids byte-by-byte timing attacks
  if (signature.length !== expected.length ||
      !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return res.status(401).json({ error: "Invalid signature" })
  }

  // Parse + validate body
  const parsed = PayloadSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() })
  }
  const { event_id, order_id, status, message } = parsed.data
  const logger = req.scope.resolve("logger") as any

  try {
    const knex = (req.scope as any).manager.getConnection().getKnex()

    // Idempotency check
    const seen = await knex.raw(
      `SELECT event_id FROM cs.webhook_events_in WHERE event_id = ? AND source = 'production'`,
      [event_id]
    )
    if (seen.rows.length > 0) {
      return res.status(200).json({ ok: true, deduplicated: true })
    }

    // Log inbound
    await knex.raw(
      `INSERT INTO cs.webhook_events_in (event_id, source, order_id, status, payload, received_at)
       VALUES (?, 'production', ?, ?, ?::jsonb, NOW())`,
      [event_id, order_id, status, JSON.stringify(parsed.data)]
    )

    // Update order metadata + emit internal event for downstream subscribers
    const orderModule = req.scope.resolve(Modules.ORDER)
    try {
      await orderModule.updateOrders([
        {
          id: order_id,
          metadata: {
            production_status: status,
            production_message: message ?? null,
            production_updated_at: parsed.data.occurred_at,
          },
        },
      ])
    } catch (err) {
      logger.warn(`[webhook-in/production] Order ${order_id} update failed: ${(err as Error).message}`)
    }

    // Fire internal event so email/SMS subscribers can react
    const eventBus = req.scope.resolve(Modules.EVENT_BUS) as any
    await eventBus.emit({
      name: `production.${status}`,
      data: { order_id, status, message },
    })

    logger.info(`[webhook-in/production] ${event_id} → order ${order_id} = ${status}`)

    return res.status(200).json({ ok: true })
  } catch (err) {
    logger.error(`[webhook-in/production] failed: ${(err as Error).message}`)
    return res.status(500).json({ error: "Internal error" })
  }
}
