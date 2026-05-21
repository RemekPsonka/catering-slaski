import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { B2B_ACCOUNTS_MODULE } from "../../../../modules/b2b-accounts"
import { Modules } from "@medusajs/framework/utils"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(2),
  legal_name: z.string().min(2),
  vat_number: z.string().regex(/^\d{10}$|^PL\d{10}$/, "Invalid PL NIP"),
  primary_contact_name: z.string().min(2),
  primary_contact_email: z.string().email(),
  primary_contact_phone: z.string().optional(),
  account_type: z.enum(["one_time_event", "recurring", "smartlunch"]).default("recurring"),
  billing_address: z.object({
    street: z.string(),
    city: z.string(),
    postal_code: z.string(),
    country: z.string().default("PL"),
  }),
  smartlunch_subsidy_cents: z.number().optional(),
})

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() })
  const svc = req.scope.resolve(B2B_ACCOUNTS_MODULE) as any
  const notify = req.scope.resolve(Modules.NOTIFICATION) as any
  const [existing] = await svc.listAndCountB2BAccounts({ vat_number: parsed.data.vat_number }, { take: 1 })
  if (existing?.length) {
    return res.status(409).json({ message: "VAT already registered" })
  }
  const created = await svc.createB2BAccounts({
    ...parsed.data,
    status: "pending_verification",
  })
  await notify.createNotifications({
    to: process.env.ADMIN_EMAIL ?? "zamowienia@cateringslaski.pl",
    channel: "email",
    template: "b2b-account-registered",
    data: {
      subject: `[B2B] Nowe konto firmowe: ${parsed.data.name}`,
      html: `<p>Nowe konto B2B czeka na weryfikację:</p>
        <ul>
          <li><strong>${parsed.data.name}</strong> (${parsed.data.legal_name})</li>
          <li>NIP: ${parsed.data.vat_number}</li>
          <li>Typ: ${parsed.data.account_type}</li>
          <li>Kontakt: ${parsed.data.primary_contact_name} · ${parsed.data.primary_contact_email}</li>
        </ul>
        <p><a href="${process.env.MEDUSA_BACKEND_URL}/app/b2b-accounts">Otwórz w adminie</a></p>`,
    },
  }).catch(() => {})
  return res.status(201).json({ b2b_account: created })
}
