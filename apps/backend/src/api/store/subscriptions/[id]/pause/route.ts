import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const auth = (req as any).auth
  if (!auth?.actor_id) return res.status(401).json({ message: "auth required" })
  const svc = req.scope.resolve("subscriptions") as any
  const sub = await svc.retrieveSubscription(req.params.id).catch(() => null)
  if (!sub || sub.customer_id !== auth.actor_id) return res.status(404).json({ message: "not found" })
  const until = (req.body as any)?.until
  const updated = await svc.updateSubscriptions({
    id: sub.id,
    status: "paused",
    paused_at: new Date(),
    paused_until: until ? new Date(until) : null,
  })
  return res.json({ subscription: updated })
}
