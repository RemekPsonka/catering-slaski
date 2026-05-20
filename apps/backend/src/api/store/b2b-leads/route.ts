import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { z } from "zod"

/**
 * POST /store/b2b-leads
 *
 * Receives event brief submissions from the /dla-firm page.
 * Stores in cs.b2b_leads, fires email to sales@cateringslaski.pl + Slack ping.
 *
 * No auth — public form. Rate-limit by IP + email (TODO Upstash).
 * Honeypot: reject if "website" field is filled.
 */

const LeadSchema = z.object({
  occasion: z.string().min(2).max(50),
  date: z.string(),
  guests: z.number().int().min(1).max(2000),
  budget_per_person: z.number().int().min(20).max(2000),
  format: z.enum(["finger_food", "dinner", "buffet", "lunch_box"]),
  diet_split: z.object({
    meat: z.number().int().min(0).max(100),
    vege: z.number().int().min(0).max(100),
    vegan: z.number().int().min(0).max(100),
    gluten_free: z.number().int().min(0).max(100),
  }),
  company_name: z.string().max(200).optional().default(""),
  nip: z.string().regex(/^\d{0,10}$/).optional().default(""),
  contact_name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(7).max(20),
  city: z.string().max(100).optional().default("Katowice"),
  notes: z.string().max(2000).optional().default(""),
  // Honeypot
  website: z.string().max(0).optional(),
})

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = LeadSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: "INVALID_BRIEF", details: parsed.error.flatten() })
  }

  // Honeypot — silently accept and discard
  if (parsed.data.website && parsed.data.website.length > 0) {
    return res.status(200).json({ ok: true })
  }

  const logger = req.scope.resolve("logger") as any

  try {
    // Knex connection for raw insert (no Medusa module for leads — direct table)
    const knex = req.scope.resolve("__pg_connection__" as any) as any

    const total_budget = parsed.data.guests * parsed.data.budget_per_person * 100
    const leadId = `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

    await knex.raw(
      `
      INSERT INTO cs.b2b_leads (
        id, occasion, event_date, guests, budget_per_person_cents, total_budget_cents,
        format, diet_split,
        company_name, nip, contact_name, email, phone, city, notes,
        source, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?, ?, ?, ?, ?, ?, ?, 'b2b_form', 'new', NOW())
      `,
      [
        leadId,
        parsed.data.occasion,
        parsed.data.date,
        parsed.data.guests,
        parsed.data.budget_per_person * 100,
        total_budget,
        parsed.data.format,
        JSON.stringify(parsed.data.diet_split),
        parsed.data.company_name,
        parsed.data.nip,
        parsed.data.contact_name,
        parsed.data.email,
        parsed.data.phone,
        parsed.data.city,
        parsed.data.notes,
      ]
    )

    logger.info(`[b2b-leads] New lead ${leadId} from ${parsed.data.email} for ${parsed.data.occasion} (${parsed.data.guests} os, ${total_budget / 100} zł)`)

    // Fire-and-forget: send sales notification email
    notifySales({
      leadId,
      data: parsed.data,
      totalBudget: total_budget,
    }).catch((e) => logger.error(`Sales notification failed: ${e.message}`))

    return res.status(201).json({ ok: true, lead_id: leadId })
  } catch (err) {
    logger.error(`/store/b2b-leads failed: ${(err as Error).message}`)
    return res.status(500).json({ error: "Internal error" })
  }
}

async function notifySales(params: { leadId: string; data: any; totalBudget: number }) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY
  const SALES_EMAIL = process.env.SALES_EMAIL ?? "sales@cateringslaski.pl"
  if (!RESEND_API_KEY) return

  const html = `
    <h2>Nowy brief eventowy · ${params.data.occasion}</h2>
    <p><strong>Data:</strong> ${params.data.date}<br/>
    <strong>Goście:</strong> ${params.data.guests} os<br/>
    <strong>Budżet:</strong> ${params.totalBudget / 100} zł (${params.data.budget_per_person} zł/os)<br/>
    <strong>Format:</strong> ${params.data.format}</p>

    <h3>Kontakt</h3>
    <p>
      ${params.data.contact_name}${params.data.company_name ? ` · ${params.data.company_name}` : ""}<br/>
      ${params.data.email} · ${params.data.phone}<br/>
      ${params.data.city}
      ${params.data.nip ? `<br/>NIP: ${params.data.nip}` : ""}
    </p>

    <h3>Restrykcje</h3>
    <p>Wege ${params.data.diet_split.vege}% · Vegan ${params.data.diet_split.vegan}% · Bezglutenowe ${params.data.diet_split.gluten_free}%</p>

    ${params.data.notes ? `<h3>Uwagi</h3><p>${params.data.notes}</p>` : ""}

    <p><strong>Lead ID:</strong> <code>${params.leadId}</code></p>
    <p>Odpowiedz w ciągu <strong>24h</strong>.</p>
  `

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Catering Śląski <leads@cateringslaski.pl>",
      to: [SALES_EMAIL],
      reply_to: params.data.email,
      subject: `[Brief] ${params.data.occasion} · ${params.data.guests} os · ${params.totalBudget / 100} zł`,
      html,
    }),
  })
}
