// @ts-nocheck
import { model } from "@medusajs/framework/utils"

/**
 * ProductAvailability — kalendarz dostępności dania.
 *
 * Reguły:
 *   - weekdays[]: które dni tygodnia danie jest dostępne (0=Sun..6=Sat). Pusta = wszystkie.
 *   - available_from/to: zakres dat (sezonowość — np. tylko grudzień)
 *   - daily_limit: max porcji per dzień (nullable = unlimited)
 *   - kitchen_lead_minutes: ile minut wcześniej kuchnia musi wiedzieć (cut-off composition)
 *   - zone_restrictions[]: opcjonalnie ogranicz do konkretnych stref
 *
 * Lookup: storefront /menu?date=2026-05-22 zwraca produkty, których:
 *   - is_available_on(date) == true
 *   - daily_count(date) < daily_limit
 *
 * Zlicznik current_count_today aktualizowany przez subscriber order.placed.
 */
export const ProductAvailability = model.define("ProductAvailability", {
  id: model.id({ prefix: "pa" }).primaryKey(),
  product_id: model.text(),
  variant_id: model.text().nullable(), // null = applies to all variants
  weekdays: model.json().nullable(),
  available_from: model.dateTime().nullable(),
  available_to: model.dateTime().nullable(),
  daily_limit: model.number().nullable(),
  kitchen_lead_minutes: model.number().default(60),
  // ograniczenie do stref (slugs)
  zone_restrictions: model.json().nullable(),
  notes: model.text().nullable(),
  is_active: model.boolean().default(true),
})

/**
 * DailyCount — aktualne zaksięgowane zamówienia per (product, date).
 * Inkrementowany przez subscriber order.placed (lub payment.captured), używany
 * przy storefront query "czy danie nadal dostępne".
 *
 * Uwaga: w wielo-instancyjnym deployu — używać `select ... for update` w service
 * (Medusa transakcyjnie OK przez Mikro ORM).
 */
export const ProductDailyCount = model.define("ProductDailyCount", {
  id: model.id({ prefix: "pdc" }).primaryKey(),
  product_id: model.text(),
  variant_id: model.text().nullable(),
  count_date: model.dateTime(),
  ordered_quantity: model.number().default(0),
  // produkcja zarezerwowana = zatwierdzone zamówienia (po payment.captured)
  reserved_quantity: model.number().default(0),
  // anulowane przed produkcją
  cancelled_quantity: model.number().default(0),
})
