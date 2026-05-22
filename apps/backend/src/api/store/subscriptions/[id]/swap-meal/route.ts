// @ts-nocheck
import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

/**
 * POST /store/subscriptions/:id/swap-meal { date, original_product_id, replacement_product_id }
 * Zmiana dania na konkretny dzień. Zapisuje override w meal_overrides[].
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const auth = (req as any).auth
  if (!auth?.actor_id) return res.status(401).json({ message: "auth required" })
  const svc = req.scope.resolve("subscriptions") as any
  const sub = await svc.retrieveSubscription(req.params.id).catch(() => null)
  if (!sub || sub.customer_id !== auth.actor_id) return res.status(404).json({ message: "not found" })
  const { date, original_product_id, replacement_product_id } = (req.body ?? {}) as any
  if (!date || !replacement_product_id) {
    return res.status(400).json({ message: "date and replacement_product_id required" })
  }
  const overrides: any[] = Array.isArray(sub.meal_overrides) ? [...sub.meal_overrides] : []
  overrides.push({
    date,
    original_product_id,
    replacement_product_id,
    applied_at: new Date().toISOString(),
  })
  const updated = await svc.updateSubscriptions({ id: sub.id, meal_overrides: overrides })
  return res.json({ subscription: updated })
}
