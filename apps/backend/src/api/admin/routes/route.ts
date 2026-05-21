import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { PRODUCTION_MODULE } from "../../../modules/production"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const date = req.query.date as string | undefined
  const svc = req.scope.resolve(PRODUCTION_MODULE) as any
  const filters: Record<string, unknown> = {}
  if (date) filters.route_date = date
  const [routes, count] = await svc.listAndCountDeliveryRoutes(filters, { take: 100 })
  return res.json({ routes, count })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve(PRODUCTION_MODULE) as any
  const created = await svc.createDeliveryRoutes(req.body as Record<string, unknown>)
  return res.json({ route: created })
}
