// @ts-nocheck
import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve("delivery_zones") as any
  const [zones, count] = await svc.listAndCountDeliveryZones({}, { take: 200 })
  return res.json({ delivery_zones: zones, count })
}
