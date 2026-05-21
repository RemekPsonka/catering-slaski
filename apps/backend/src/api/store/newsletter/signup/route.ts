import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { NEWSLETTER_MODULE } from "../../../../modules/newsletter"
import { Modules } from "@medusajs/framework/utils"
import { z } from "zod"

const schema = z.object({
  email: z.string().email(),
  consent_text: z.string().min(10),
  source: z.string().max(100).optional(),
})

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ message: "invalid", errors: parsed.error.flatten() })
  }
  const svc = req.scope.resolve(NEWSLETTER_MODULE) as any
  const notify = req.scope.resolve(Modules.NOTIFICATION) as any
  const ip = (req.headers["x-forwarded-for"]?.toString().split(",")[0] ?? req.ip) as string
  const ua = req.headers["user-agent"]?.toString().slice(0, 255) ?? null

  const [existing] = await svc.listAndCountNewsletterSubscribers(
    { email: parsed.data.email.toLowerCase() },
    { take: 1 },
  )
  let row = existing?.[0]
  if (row?.status === "confirmed") {
    return res.json({ ok: true, already_confirmed: true })
  }
  const token = svc.generateToken()
  const consent_hash = svc.hashConsent(parsed.data.consent_text)
  const expires_at = new Date(Date.now() + 72 * 60 * 60 * 1000) // 72h

  if (row) {
    await svc.updateNewsletterSubscribers({
      id: row.id,
      status: "pending",
      confirmation_token: token,
      token_expires_at: expires_at,
      consent_ip: ip,
      consent_user_agent: ua,
      consent_text_hash: consent_hash,
      source: parsed.data.source ?? row.source,
    })
  } else {
    row = await svc.createNewsletterSubscribers({
      email: parsed.data.email.toLowerCase(),
      status: "pending",
      confirmation_token: token,
      token_expires_at: expires_at,
      consent_ip: ip,
      consent_user_agent: ua,
      consent_text_hash: consent_hash,
      source: parsed.data.source ?? "unknown",
    })
  }

  const url = `${process.env.STOREFRONT_URL ?? "https://cateringslaski.pl"}/newsletter/potwierdzenie?token=${token}`
  const html = `
    <p>Cześć!</p>
    <p>Potwierdź zapis do newslettera Catering Śląski klikając w link:</p>
    <p><a href="${url}">${url}</a></p>
    <p>Link wygasa za 72h. Jeśli nie Ty zapisałeś się — zignoruj ten mail.</p>`
  await notify.createNotifications({
    to: parsed.data.email,
    channel: "email",
    template: "newsletter-confirmation",
    data: { subject: "Potwierdź zapis do newslettera Catering Śląski", html },
  }).catch(() => {})
  return res.json({ ok: true, message: "Sprawdź skrzynkę i potwierdź zapis." })
}
