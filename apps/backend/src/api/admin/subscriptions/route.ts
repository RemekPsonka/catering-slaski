// @ts-nocheck
import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve("subscriptions") as any
  const [subs, count] = await svc.listAndCountSubscriptions({}, { take: 200 })
  return res.json({ subscriptions: subs, count })
}
