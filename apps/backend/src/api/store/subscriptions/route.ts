// @ts-nocheck
/**
 * GET /store/subscriptions — list dla zalogowanego klienta
 * POST /store/subscriptions — utwórz nową subskrypcję
 */
import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const auth = (req as any).auth
  if (!auth?.actor_id) return res.status(401).json({ message: "auth required" })
  const svc = req.scope.resolve("subscriptions") as any
  const [subs, count] = await svc.listAndCountSubscriptions(
    { customer_id: auth.actor_id },
    { take: 50, order: { created_at: "DESC" } },
  )
  return res.json({ subscriptions: subs, count })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const auth = (req as any).auth
  if (!auth?.actor_id) return res.status(401).json({ message: "auth required" })
  const svc = req.scope.resolve("subscriptions") as any
  const body = req.body as any
  const created = await svc.createSubscriptions({
    customer_id: auth.actor_id,
    plan_code: body.plan_code,
    plan_name: body.plan_name,
    status: "active",
    next_run_at: body.next_run_at ?? new Date(Date.now() + 24 * 60 * 60 * 1000),
    config: body.config ?? {},
  })
  return res.json({ subscription: created })
}
