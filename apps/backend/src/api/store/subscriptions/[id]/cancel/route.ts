import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const auth = (req as any).auth
  if (!auth?.actor_id) return res.status(401).json({ message: "auth required" })
  const svc = req.scope.resolve("subscriptions") as any
  const sub = await svc.retrieveSubscription(req.params.id).catch(() => null)
  if (!sub || sub.customer_id !== auth.actor_id) return res.status(404).json({ message: "not found" })
  const reason = String((req.body as any)?.reason ?? "")
  const updated = await svc.updateSubscriptions({
    id: sub.id,
    status: "cancelled",
    cancelled_at: new Date(),
    cancellation_reason: reason,
  })
  return res.json({ subscription: updated })
}
