import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { NEWSLETTER_MODULE } from "../../../modules/newsletter"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve(NEWSLETTER_MODULE) as any
  const status = req.query.status as string | undefined
  const filters: Record<string, unknown> = {}
  if (status) filters.status = status
  const [subscribers, count] = await svc.listAndCountNewsletterSubscribers(filters, { take: 200 })
  return res.json({ subscribers, count })
}
