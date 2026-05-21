import { model } from "@medusajs/framework/utils"

/**
 * DeliveryMethod — katalog sposobów dostawy.
 *
 * Każdy sposób jest globalny, ale strefa (DeliveryZone.supported_methods)
 * referuje go po `code`. Konfiguracja domyślna kosztów; per-strefa overrides
 * w przyszłości via DeliveryZoneMethodConfig (TODO).
 *
 * Sposoby przewidziane:
 *   own_fleet           — własny kierowca w strefie miejskiej
 *   courier_dpd         — DPD chłodnia D+1 ogólnopolska
 *   courier_inpost      — InPost paczkomat (suchy prowiant)
 *   pickup_own          — odbiór osobisty z punktu firmowego
 *   pickup_partner      — odbiór z punktu partnerskiego (jeśli mamy)
 *   third_party_glovo   — Glovo same-day
 *   third_party_wolt    — Wolt same-day
 *   third_party_stuart  — Stuart on-demand kurier
 *   local_courier_manual — lokalny kurier ad-hoc (zlecenie ręczne)
 */
export const DeliveryMethod = model.define("DeliveryMethod", {
  id: model.id({ prefix: "dm" }).primaryKey(),
  code: model.text().unique(),
  name: model.text(),
  description: model.text().nullable(),
  // Czy wymaga termoboxa / lodu
  requires_thermal_packaging: model.boolean().default(false),
  // Czy wspiera same-day (cutoff < 6h)
  supports_same_day: model.boolean().default(false),
  // Czy wspiera weekend
  supports_weekend: model.boolean().default(true),
  // Domyślny koszt (per strefa może być nadpisany)
  default_cost_cents: model.number().default(0),
  // Domyślny lead time (dni)
  default_lead_time_days: model.number().default(1),
  // Domyślny cut-off (godzina rezerwacji = dzień przed dostawą)
  default_cutoff_hour: model.number().default(18),
  // Czy zwraca tracking number (integracja API)
  has_tracking: model.boolean().default(false),
  // Pakiet kategoryczny — które produkty mogą iść (np. paczkomat tylko sucha żywność)
  allowed_categories: model.json().nullable(),
  // Display order (UI)
  sort_order: model.number().default(100),
  is_active: model.boolean().default(true),
  // Provider config — dla integracji API (DPD klient, etc.) — encrypted on app level
  provider_config: model.json().nullable(),
})
