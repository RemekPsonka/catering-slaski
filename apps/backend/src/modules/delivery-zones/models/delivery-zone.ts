import { model } from "@medusajs/framework/utils"

/**
 * Delivery Zone — geograficzny polygon z regułami dostawy
 *
 * Geometry kolumna `polygon` jest obsługiwana przez raw SQL (PostGIS),
 * nie przez Mikro ORM. W modelu mamy ją jako `unknown` — service korzysta
 * z raw queries dla operacji geograficznych.
 *
 * Schema w infra/postgres/init.sql tworzy ją jako geometry(MultiPolygon, 4326).
 */
export const DeliveryZone = model.define("delivery_zone", {
  id: model.id({ prefix: "dz" }).primaryKey(),
  name: model.text(),
  slug: model.text().unique(),
  zone_type: model.enum(["local", "regional", "national"]),
  delivery_method: model.enum([
    "own_fleet",
    "courier_dpd",
    "courier_inpost",
    "pickup_only",
  ]),
  // polygon: raw column (PostGIS), managed via SQL — not in model
  base_delivery_fee_cents: model.number().default(0),
  free_delivery_threshold_cents: model.number().nullable(),
  min_order_cents: model.number().default(0),
  lead_time_days: model.number().default(0),
  cutoff_hour: model.number().default(18),
  cutoff_minute: model.number().default(0),
  allowed_product_categories: model.json().default({ categories: ["catering_boxes"] }),
  max_transport_hours: model.number().nullable(),
  priority: model.number().default(100),
  is_active: model.boolean().default(true),
  display_color: model.text().default("#E54B17"),
})

export type DeliveryZoneType = {
  id: string
  name: string
  slug: string
  zone_type: "local" | "regional" | "national"
  delivery_method:
    | "own_fleet"
    | "courier_dpd"
    | "courier_inpost"
    | "pickup_only"
  base_delivery_fee_cents: number
  free_delivery_threshold_cents: number | null
  min_order_cents: number
  lead_time_days: number
  cutoff_hour: number
  cutoff_minute: number
  allowed_product_categories: string[]
  max_transport_hours: number | null
  priority: number
  is_active: boolean
  display_color: string
  created_at: Date
  updated_at: Date
}
