// @ts-nocheck
/**
 * SeoMeta — per-path SEO override stored in Postgres.
 *
 * Identified by `path` (e.g. "/menu", "/produkt/zurek-slaski"). The storefront
 * GET /store/seo?path=... checks for an override and merges with code defaults.
 *
 * `path` is unique → upsert semantics from admin UI.
 */
import { model } from "@medusajs/framework/utils"

const SeoMeta = model.define("seo_meta", {
  id: model.id().primaryKey(),
  path: model.text().unique().searchable(),
  title: model.text().nullable(),
  description: model.text().nullable(),
  og_title: model.text().nullable(),
  og_description: model.text().nullable(),
  og_image: model.text().nullable(),
  twitter_title: model.text().nullable(),
  twitter_description: model.text().nullable(),
  twitter_image: model.text().nullable(),
  canonical: model.text().nullable(),
  robots: model.text().nullable(), // "index,follow" | "noindex" | etc.
  keywords: model.json().nullable(), // string[]
  json_ld: model.json().nullable(), // extra schema.org payload (FAQ, HowTo, etc.)
  is_active: model.boolean().default(true),
  notes: model.text().nullable(), // admin's internal note
})

export default SeoMeta
