import { model } from "@medusajs/framework/utils"

/**
 * DietaryProfile — persistent customer preferences.
 *
 * Stored separately from Medusa Customer (custom module) so we can:
 *   - filter catalog automatically po zalogowaniu
 *   - propagate na każdy item w abonamencie
 *   - eksportować dane GDPR cleanly
 *
 * Lookup: customer_id (unique).
 */
export const DietaryProfile = model.define("DietaryProfile", {
  id: model.id({ prefix: "dp" }).primaryKey(),
  customer_id: model.text().unique(),
  // Diet flags (multi-select)
  diet_tags: model.json().nullable(), // ["vegetarian", "vegan", "gluten_free", "keto", "halal", "kosher"]
  // Alergeny do wykluczenia
  excluded_allergens: model.json().nullable(), // ["gluten", "milk", "eggs", "nuts", "soy", "fish", "shellfish", "celery", "mustard", "sesame", "sulfur", "lupin", "mollusks"]
  // Składniki do wykluczenia (osobiste — np. "nie lubię kolendry")
  disliked_ingredients: model.json().nullable(),
  // Cele kaloryczne
  target_calories_per_day: model.number().nullable(),
  target_protein_g: model.number().nullable(),
  // Wielkość posiłków
  portion_size: model.enum(["small", "regular", "large"]).default("regular"),
  // Ostrość
  spice_preference: model.enum(["mild", "medium", "spicy", "very_spicy"]).nullable(),
  // Notatki dla kuchni
  kitchen_notes: model.text().nullable(),
  // Notatki dla kierowcy (default)
  default_delivery_notes: model.text().nullable(),
  // Domyślny adres delivery (FK do shipping_address)
  default_shipping_address_id: model.text().nullable(),
})
