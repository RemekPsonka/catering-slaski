import { model } from "@medusajs/framework/utils"

/**
 * ProductionRun — sesja produkcyjna kuchni dla konkretnej daty.
 * Tworzony nightly (cron 18:00) lub manual przez Production page.
 * Agreguje line items wszystkich confirmed orders na tę datę.
 */
export const ProductionRun = model.define("ProductionRun", {
  id: model.id({ prefix: "prun" }).primaryKey(),
  production_date: model.dateTime(),
  status: model
    .enum(["planned", "in_progress", "completed", "cancelled"])
    .default("planned"),
  // Lista order_ids w tej produkcji
  order_ids: model.json().nullable(),
  // Aggregated line items: [{ product_id, name, qty, allergens, notes }]
  aggregated_items: model.json().nullable(),
  // Notatki dla zespołu
  kitchen_notes: model.text().nullable(),
  started_at: model.dateTime().nullable(),
  completed_at: model.dateTime().nullable(),
  // Operator
  shift_manager_id: model.text().nullable(),
})

/**
 * DeliveryRoute — przypisanie zamówień do kierowcy + kolejność + ETA.
 *
 * Tworzony przez admina (manual) lub auto-router (TSP solve — Phase 2).
 * Status pokazuje gdzie jest kierowca.
 */
export const DeliveryRoute = model.define("DeliveryRoute", {
  id: model.id({ prefix: "droute" }).primaryKey(),
  route_date: model.dateTime(),
  zone_id: model.text(),
  driver_id: model.text().nullable(), // FK do user (kierowca)
  driver_name: model.text().nullable(),
  driver_phone: model.text().nullable(),
  vehicle: model.text().nullable(), // numer rejestracyjny / typ
  // Stops: [{ order_id, sequence, address, lat, lng, eta, status, notes }]
  stops: model.json().nullable(),
  status: model
    .enum(["draft", "assigned", "in_progress", "completed", "cancelled"])
    .default("draft"),
  estimated_distance_km: model.number().nullable(),
  estimated_duration_min: model.number().nullable(),
  started_at: model.dateTime().nullable(),
  completed_at: model.dateTime().nullable(),
  // HACCP — temperatura przy załadunku/dostawie
  loading_temp_celsius: model.number().nullable(),
  loading_temp_at: model.dateTime().nullable(),
})

/**
 * KitchenLabel — pojedyncza etykieta na pojemnik.
 * Generowana po payment.captured. PDF jest renderowany na żądanie.
 */
export const KitchenLabel = model.define("KitchenLabel", {
  id: model.id({ prefix: "klbl" }).primaryKey(),
  order_id: model.text(),
  line_item_id: model.text(),
  product_id: model.text(),
  product_name: model.text(),
  customer_name: model.text(),
  delivery_date: model.dateTime(),
  delivery_slot: model.text().nullable(),
  // Lista alergenów (zhighlightowane czerwonym)
  allergens: model.json().nullable(),
  // kcal per portion
  calories_per_portion: model.number().nullable(),
  portions: model.number().default(1),
  // QR code z linkiem do order detail
  qr_payload: model.text().nullable(),
  // Audit
  printed_at: model.dateTime().nullable(),
})

/**
 * QualityCheck — HACCP log: temperatury, kontrole, incydenty.
 */
export const QualityCheck = model.define("QualityCheck", {
  id: model.id({ prefix: "qcheck" }).primaryKey(),
  check_type: model.enum([
    "temperature_loading",
    "temperature_delivery",
    "visual_inspection",
    "incident",
  ]),
  related_order_id: model.text().nullable(),
  related_route_id: model.text().nullable(),
  temperature_celsius: model.number().nullable(),
  passed: model.boolean().default(true),
  notes: model.text().nullable(),
  recorded_by: model.text().nullable(),
  recorded_at: model.dateTime(),
})
