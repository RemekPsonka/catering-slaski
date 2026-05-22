// @ts-nocheck
import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { NEWSLETTER_MODULE } from "../../../../modules/newsletter"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const email = String((req.body as any)?.email ?? "").toLowerCase()
  if (!email) return res.status(400).json({ message: "email required" })
  const svc = req.scope.resolve(NEWSLETTER_MODULE) as any
  const [list] = await svc.listAndCountNewsletterSubscribers({ email }, { take: 1 })
  if (!list?.[0]) return res.status(404).json({ message: "not subscribed" })
  await svc.updateNewsletterSubscribers({
    id: list[0].id,
    status: "unsubscribed",
    unsubscribed_at: new Date(),
  })
  return res.json({ ok: true })
}
