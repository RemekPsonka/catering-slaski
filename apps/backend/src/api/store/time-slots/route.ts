// @ts-nocheck
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { z } from "zod"
import { TIME_SLOTS_MODULE } from "../../../modules/time-slots"

const QuerySchema = z.object({
  zone_id: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD"),
})

/**
 * GET /store/time-slots?zone_id=X&date=YYYY-MM-DD
 * Returns available slots for given zone + date.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const parsed = QuerySchema.safeParse(req.query)
  if (!parsed.success) {
    return res.status(400).json({ error: "INVALID_PARAMS", details: parsed.error.flatten() })
  }

  const timeSlots = req.scope.resolve(TIME_SLOTS_MODULE) as any
  const slots = await timeSlots.getAvailableSlots(parsed.data.zone_id, parsed.data.date)

  return res.status(200).json({
    zone_id: parsed.data.zone_id,
    date: parsed.data.date,
    slots,
  })
}

const ReserveSchema = z.object({
  slot_id: z.string().min(1),
  cart_id: z.string().min(1),
})

/**
 * POST /store/time-slots/reserve
 * Body: { slot_id, cart_id }
 * Pessimistic-locked slot reservation.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = ReserveSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: "INVALID_PARAMS", details: parsed.error.flatten() })
  }

  const timeSlots = req.scope.resolve(TIME_SLOTS_MODULE) as any
  const result = await timeSlots.reserveSlot(parsed.data.slot_id, parsed.data.cart_id)

  if (!result.success) {
    const statusCode = result.error === "slot_full" ? 409 : 404
    return res.status(statusCode).json({ error: result.error })
  }

  return res.status(200).json({
    reservation_id: result.reservation_id,
    expires_at: result.expires_at,
    slot: result.slot,
  })
}
