import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { NEWSLETTER_MODULE } from "../../../../modules/newsletter"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const token = String(req.query.token ?? "").trim()
  if (!token) return res.status(400).json({ message: "token required" })
  const svc = req.scope.resolve(NEWSLETTER_MODULE) as any
  const [list] = await svc.listAndCountNewsletterSubscribers(
    { confirmation_token: token, status: "pending" },
    { take: 1 },
  )
  const row = list?.[0]
  if (!row) return res.status(404).json({ message: "invalid or used token" })
  if (row.token_expires_at && new Date(row.token_expires_at) < new Date()) {
    return res.status(410).json({ message: "token expired" })
  }
  await svc.updateNewsletterSubscribers({
    id: row.id,
    status: "confirmed",
    confirmed_at: new Date(),
    confirmation_token: null,
    welcome_code: row.welcome_code ?? `WITAJ${Math.floor(Math.random() * 9000 + 1000)}`,
  })
  return res.json({ ok: true, welcome_code: row.welcome_code })
}
