// @ts-nocheck
import { model } from "@medusajs/framework/utils"

/**
 * cs.product_attributes — extends Medusa product with catering-specific metadata
 * keyed by product_id (Medusa product reference).
 *
 * Stored in the cs schema alongside other Catering Śląski tables.
 */
export const ProductAttribute = model.define(
  { name: "ProductAttribute", tableName: "cs.product_attributes" },
  {
    id: model.id().primaryKey(),
    product_id: model.text().searchable().unique(),

    // Portion / serving info
    portions_min: model.number().nullable(),
    portions_max: model.number().nullable(),
    portions_label: model.text().nullable(), // "10-12 os"

    // Dietary tags (boolean flags + JSON for extra)
    is_vegetarian: model.boolean().default(false),
    is_vegan: model.boolean().default(false),
    is_gluten_free: model.boolean().default(false),
    is_lactose_free: model.boolean().default(false),
    is_spicy: model.boolean().default(false),
    is_bestseller: model.boolean().default(false),
    is_new: model.boolean().default(false),

    // Allergens — array of EU14 codes ["gluten","milk","eggs","fish","nuts",...]
    allergens: model.json().nullable(),

    // Content listing — array of strings, what's in the box
    contents: model.json().nullable(),

    // Nutrition (optional)
    kcal_per_portion: model.number().nullable(),

    // Lead time
    min_lead_hours: model.number().default(24),

    // Categorization
    occasion_tags: model.json().nullable(), // ["komunia","wesele","biuro","sylwester"]
    season_tags: model.json().nullable(),   // ["wiosna","lato","jesien","zima"]

    // Cross-sell hints
    cross_sell_ids: model.json().nullable(), // array of product_id

    // SEO + display
    short_description: model.text().nullable(),
    rating_avg: model.number().nullable(),
    rating_count: model.number().default(0),
  }
)
