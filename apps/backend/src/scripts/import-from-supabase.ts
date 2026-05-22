// @ts-nocheck
/**
 * One-shot importer: cs.products (Supabase) → Medusa products.
 *
 * Usage:
 *   RAILWAY_LOCAL_RUN=1 pnpm tsx src/scripts/import-from-supabase.ts
 *
 * Idempotent: skips products whose `handle` already exists in Medusa.
 * Creates one variant per product with PLN price from price_cents.
 * Catering attributes are stored in product.metadata + the catering_attributes
 * module record (linked by product_id).
 *
 * Requires envs:
 *   - DATABASE_URL (Medusa)
 *   - NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL
 *   - NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY
 *   - DEFAULT_REGION_ID or DEFAULT_SALES_CHANNEL_ID (optional)
 */
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { ExecArgs } from "@medusajs/framework/types"
import { createClient } from "@supabase/supabase-js"

type SupaRow = {
  id: string
  handle: string
  title: string
  description: string | null
  category: string
  price_cents: number
  thumbnail: string | null
  portions_label: string | null
  is_vegetarian: boolean
  is_vegan: boolean
  is_gluten_free: boolean
  is_bestseller: boolean
  is_new: boolean
  allergens: string[] | null
  contents: string[] | null
  occasion_tags: string[] | null
}

export default async function importFromSupabase({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule = container.resolve(Modules.PRODUCT) as any
  const cateringAttr = container.resolve("catering_attributes") as any

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    logger.error("Supabase URL or key missing")
    return
  }
  const supa = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: "cs" },
  })
  const { data, error } = await supa.from("products").select("*")
  if (error) {
    logger.error(`Supabase read failed: ${error.message}`)
    return
  }
  const rows = (data ?? []) as SupaRow[]
  logger.info(`[import] ${rows.length} products in Supabase`)

  let created = 0
  let skipped = 0
  for (const r of rows) {
    const [existing] = await productModule.listAndCountProducts({ handle: r.handle }, { take: 1 })
    if (existing?.length) {
      skipped++
      continue
    }

    const product = await productModule.createProducts({
      title: r.title,
      handle: r.handle,
      description: r.description ?? "",
      status: "published",
      thumbnail: r.thumbnail ?? undefined,
      images: r.thumbnail ? [{ url: r.thumbnail }] : [],
      metadata: {
        category: r.category,
        portions_label: r.portions_label,
        is_bestseller: r.is_bestseller,
        is_new: r.is_new,
        source: "supabase-import",
      },
      options: [{ title: "Wariant", values: ["Default"] }],
      variants: [
        {
          title: "Default",
          sku: r.handle + "-default",
          options: { Wariant: "Default" },
          prices: [{ amount: r.price_cents, currency_code: "pln" }],
          manage_inventory: false,
        },
      ],
    })

    // Mirror to catering_attributes module
    try {
      await cateringAttr.createProductAttributes?.({
        product_id: product.id,
        portions_label: r.portions_label,
        is_vegetarian: r.is_vegetarian,
        is_vegan: r.is_vegan,
        is_gluten_free: r.is_gluten_free,
        is_bestseller: r.is_bestseller,
        is_new: r.is_new,
        allergens: r.allergens ?? [],
        contents: r.contents ?? [],
        occasion_tags: r.occasion_tags ?? [],
      })
    } catch (err: any) {
      logger.warn(`catering attr write failed for ${r.handle}: ${err.message}`)
    }
    created++
    logger.info(`[import] +${r.handle}`)
  }
  logger.info(`[import] done — created=${created} skipped=${skipped}`)
}
