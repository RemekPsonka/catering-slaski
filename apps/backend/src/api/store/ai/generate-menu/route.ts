import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { z } from "zod"
import Anthropic from "@anthropic-ai/sdk"
import { rateLimit, getClientIp } from "../../../../lib/rate-limit"

const RequestSchema = z.object({
  brief: z.string().min(20).max(2000),
  budget_per_person_pln: z.number().int().min(20).max(500).optional(),
  guests: z.number().int().min(1).max(500).optional(),
  zone_id: z.string().optional(),
})

const CATERING_AI_SYSTEM_PROMPT = `
Jesteś asystentem AI dla cateringu "Catering Śląski" — działającego na Górnym Śląsku w Polsce.

Twoje zadanie: na podstawie briefu klienta zaproponuj menu z naszego katalogu (otrzymasz listę produktów).

ZASADY:
1. Wybieraj WYŁĄCZNIE produkty z listy dostarczonej w "available_products"
2. Bilans menu zależy od typu eventu:
   - komunia/wesele: 60% mięsne, 30% wege, 10% słodkie
   - urodziny/koktajl party: 50% finger food, 20% mięsne, 20% słodkie, 10% wege
   - lunch firmowy: 70% danie główne (mix), 20% sałatki, 10% deser
3. Porcje per osoba (KRYTYCZNE):
   - finger food party: 8-12 sztuk/os
   - obiad: 1 danie główne + 1 dodatek/os
   - lunch box: 1 box/os
4. RESPEKTUJ budżet — propozycja powinna mieścić się w 90-100% budżetu
5. Uwzględnij restrykcje (vege %, vegan %, gluten-free)
6. Sezonowość: lato → lekkie sałatki, zima → ciepłe rosoły
7. NIE proponuj produktów które nie są na liście — nawet jeśli klient o nie prosi

OUTPUT FORMAT: zwróć WYŁĄCZNIE poprawny JSON, bez markdown bloków:
{
  "items": [
    { "product_id": "prod_xyz", "quantity": 3, "reasoning": "powód wyboru" }
  ],
  "reasoning_overall": "krótkie 1-2 zdania uzasadnienia całości menu",
  "balance": { "meat_pct": 60, "vege_pct": 30, "sweet_pct": 10 },
  "portions_per_guest_estimated": 10,
  "total_estimated_cents": 750000,
  "in_budget": true,
  "recommendations": ["sugestia 1", "sugestia 2"]
}

Pamiętaj: catering ślaski to TRADYCYJNA polska kuchnia z domowymi recepturami. NIE proponuj "fine dining", NIE używaj słów "wykwintny" itd. Brand voice: prosto, mocno, bez ściemy.
`.trim()

/**
 * POST /store/ai/generate-menu
 *
 * Wywołuje Claude API z briefem klienta + katalogiem produktów.
 * Zwraca structured proposal.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const ip = getClientIp(req)

  // Rate limit: 10 AI generations per IP per hour (Claude API kosztuje ~$0.03/call).
  // Defense against scraping the menu corpus + cost blow-out.
  const limitCheck = await rateLimit({
    key: `ai-menu:ip:${ip}`,
    limit: 10,
    windowSec: 3600,
  })
  if (!limitCheck.allowed) {
    res.setHeader("Retry-After", String(limitCheck.retryAfter))
    return res.status(429).json({
      error: "TOO_MANY_REQUESTS",
      message: "Wykorzystałeś dzienny limit AI Generator. Wróć za godzinę albo wypełnij brief: /dla-firm",
    })
  }

  const parsed = RequestSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      error: "INVALID_BRIEF",
      details: parsed.error.flatten(),
    })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(503).json({ error: "AI_NOT_CONFIGURED" })
  }

  // Fetch product catalog (cached if possible)
  const productService = req.scope.resolve("product" as any) as any
  const knex = (req.scope.resolve as any)("__pg_connection__")
              || (req.scope as any).manager.getConnection().getKnex()

  // Get products with catering attributes
  const products = await knex.raw(
    `
    SELECT
      p.id, p.title AS name, p.description,
      pca.category, pca.diet_tags, pca.allergens,
      pca.portions_default, pca.production_lead_time_days,
      COALESCE(
        (SELECT amount FROM price WHERE variant_id IN
          (SELECT id FROM product_variant WHERE product_id = p.id) LIMIT 1),
        0
      ) AS price_cents
    FROM product p
    JOIN product_catering_attributes pca ON pca.product_id = p.id
    WHERE p.deleted_at IS NULL AND p.status = 'published'
    ORDER BY p.title
    LIMIT 200
    `
  )

  const catalog = products.rows.map((p: any) => ({
    product_id: p.id,
    name: p.name,
    category: p.category,
    price_pln: p.price_cents / 100,
    portions: p.portions_default,
    diet_tags: p.diet_tags || [],
    allergens: p.allergens || [],
  }))

  // Call Claude
  const anthropic = new Anthropic({ apiKey })
  const startTime = Date.now()

  const response = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
    max_tokens: 2500,
    system: CATERING_AI_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `KATALOG (${catalog.length} produktów):\n${JSON.stringify(catalog, null, 0)}\n\nBRIEF KLIENTA: ${parsed.data.brief}\n\nZwróć JSON proposal.`,
      },
    ],
  })

  const elapsed = Date.now() - startTime

  // Parse response
  const text = response.content[0].type === "text" ? response.content[0].text : ""
  let proposal: any
  try {
    // Strip markdown code blocks if present
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim()
    proposal = JSON.parse(cleaned)
  } catch (err) {
    console.error("[ai/generate-menu] JSON parse failed:", text.substring(0, 500))
    return res.status(500).json({
      error: "AI_BAD_RESPONSE",
      message: "AI zwrócił niepoprawny format. Spróbuj ponownie.",
    })
  }

  // Validate: each item must exist in catalog
  const validProductIds = new Set(catalog.map((c: any) => c.product_id))
  const invalidItems = (proposal.items || []).filter(
    (it: any) => !validProductIds.has(it.product_id)
  )

  if (invalidItems.length > 0) {
    console.warn("[ai/generate-menu] AI halluc. invalid products:", invalidItems)
    proposal.items = proposal.items.filter((it: any) =>
      validProductIds.has(it.product_id)
    )
    proposal._warnings = ["Niektóre proponowane produkty zostały odrzucone (nie istnieją w katalogu)"]
  }

  return res.status(200).json({
    proposal,
    metadata: {
      ai_model: response.model,
      tokens_input: response.usage.input_tokens,
      tokens_output: response.usage.output_tokens,
      elapsed_ms: elapsed,
      catalog_size: catalog.length,
    },
  })
}
