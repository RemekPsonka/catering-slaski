// @ts-nocheck
import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve("time_slots") as any
  const date = req.query.date as string | undefined
  const filters: Record<string, unknown> = {}
  if (date) filters.slot_date = date
  const [slots, count] = await svc.listAndCountTimeSlots(filters, { take: 200 })
  return res.json({ time_slots: slots, count })
}
