import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

/**
 * POST /store/subscriptions/:id/skip { date: "YYYY-MM-DD" }
 * Pomija jedną dostawę w abonamencie — dodaje datę do skipped_dates[].
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const auth = (req as any).auth
  if (!auth?.actor_id) return res.status(401).json({ message: "auth required" })
  const svc = req.scope.resolve("subscriptions") as any
  const sub = await svc.retrieveSubscription(req.params.id).catch(() => null)
  if (!sub || sub.customer_id !== auth.actor_id) return res.status(404).json({ message: "not found" })
  const date = String((req.body as any)?.date ?? "").trim()
  if (!date) return res.status(400).json({ message: "date required" })
  const skipped: string[] = Array.isArray(sub.skipped_dates) ? [...sub.skipped_dates] : []
  if (!skipped.includes(date)) skipped.push(date)
  const updated = await svc.updateSubscriptions({ id: sub.id, skipped_dates: skipped })
  return res.json({ subscription: updated })
}
