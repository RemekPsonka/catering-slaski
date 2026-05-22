import { model } from "@medusajs/framework/utils"

/**
 * Delivery Zone — geograficzny obszar + reguły dostawy.
 *
 * Pole `polygon` jest raw PostGIS (geometry MultiPolygon, 4326) — zarządzane
 * w SQL przez service, NIE przez Mikro ORM (Medusa model.* nie ma typu geometry).
 *
 * v2 (2026-05-21): dodane multi-method, postal_codes, delivery_days, operating_hours.
 * Backwards-compat: `delivery_method` (single enum) jest deprecated — używaj
 * `supported_methods` (array). Service migracyjny mapuje stare → nowe.
 */
export const DeliveryZone = model.define("DeliveryZone", {
  id: model.id({ prefix: "dz" }).primaryKey(),
  name: model.text(),
  slug: model.text().unique(),
  zone_type: model.enum(["local", "regional", "national"]),
  // DEPRECATED — zostawione dla kompatybilności ze starymi danymi. Use supported_methods.
  delivery_method: model
    .enum(["own_fleet", "courier_dpd", "courier_inpost", "pickup_only"])
    .nullable(),
  // v2: array of method codes — patrz DeliveryMethod model
  supported_methods: model.json().nullable(),
  // v2: kody pocztowe (5-cyfrowe PL) jako fast-path lookup
  postal_codes: model.json().nullable(),
  // v2: które dni tygodnia strefa działa (0=Sun, 1=Mon, ..., 6=Sat). Empty = wszystkie.
  delivery_days: model.json().nullable(),
  // v2: godziny operacyjne per weekday (opcjonalne)
  operating_hours: model.json().nullable(),
  // base price PLN cents
  base_delivery_fee_cents: model.number().default(0),
  free_delivery_threshold_cents: model.number().nullable(),
  min_order_cents: model.number().default(0),
  lead_time_days: model.number().default(0),
  // statyczny cut-off (godzina) — używany jeśli slot nie ma własnego
  cutoff_hour: model.number().default(18),
  cutoff_minute: model.number().default(0),
  // ograniczenie kategorii produktów (np. tylko "lunch" w strefie biurowej)
  allowed_product_categories: model.json().nullable(),
  // max transport time — dla wybranych produktów wrażliwych
  max_transport_hours: model.number().nullable(),
  // czy strefa wymaga opakowania termicznego (chłodnia, lód)
  requires_thermal_packaging: model.boolean().default(false),
  // priority — kolejność matchowania jeśli klient wpadł w przecięcie stref
  priority: model.number().default(100),
  // out-of-range fallback — czy zapisywać na newsletter
  capture_lead_when_out_of_range: model.boolean().default(true),
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
    | null
  supported_methods: string[] | null
  postal_codes: string[] | null
  delivery_days: number[] | null
  operating_hours: Record<string, { open: string; close: string }> | null
  base_delivery_fee_cents: number
  free_delivery_threshold_cents: number | null
  min_order_cents: number
  lead_time_days: number
  cutoff_hour: number
  cutoff_minute: number
  allowed_product_categories: string[] | null
  max_transport_hours: number | null
  requires_thermal_packaging: boolean
  priority: number
  capture_lead_when_out_of_range: boolean
  is_active: boolean
  display_color: string
  created_at: Date
  updated_at: Date
}
