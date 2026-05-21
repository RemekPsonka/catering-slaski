import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve("delivery_methods") as any
  const [methods, count] = await svc.listAndCountDeliveryMethods({}, { take: 100, order: { sort_order: "ASC" } })
  return res.json({ delivery_methods: methods, count })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve("delivery_methods") as any
  const created = await svc.createDeliveryMethods(req.body as Record<string, unknown>)
  return res.json({ delivery_method: created })
}
