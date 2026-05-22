// @ts-nocheck
/**
 * Seed katalogu sposobów dostawy. Idempotentny.
 *
 * Run: pnpm exec medusa exec ./src/scripts/seed-delivery-methods.ts
 */
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ExecArgs } from "@medusajs/framework/types"

const METHODS = [
  {
    code: "own_fleet",
    name: "Własny kierowca",
    description: "Dostawa własnym samochodem chłodniczym. Tylko w obsługiwanych strefach.",
    requires_thermal_packaging: false,
    supports_same_day: true,
    supports_weekend: true,
    default_cost_cents: 2900,
    default_lead_time_days: 1,
    default_cutoff_hour: 16,
    has_tracking: false,
    sort_order: 10,
  },
  {
    code: "pickup_own",
    name: "Odbiór osobisty",
    description: "Odbiór z naszej kuchni (Dąbrowa Górnicza, ul. Marcina Kasprzaka 256).",
    requires_thermal_packaging: false,
    supports_same_day: true,
    supports_weekend: false,
    default_cost_cents: 0,
    default_lead_time_days: 1,
    default_cutoff_hour: 16,
    has_tracking: false,
    sort_order: 20,
  },
  {
    code: "courier_dpd",
    name: "Kurier DPD (chłodnia)",
    description: "DPD Fresh — dostawa D+1 w całej Polsce z chłodzeniem.",
    requires_thermal_packaging: true,
    supports_same_day: false,
    supports_weekend: false,
    default_cost_cents: 2500,
    default_lead_time_days: 2,
    default_cutoff_hour: 12,
    has_tracking: true,
    sort_order: 30,
    allowed_categories: ["box", "catering_event"],
  },
  {
    code: "courier_inpost",
    name: "Paczkomat InPost",
    description: "Tylko suchy prowiant i vouchery. NIE dla świeżego jedzenia.",
    requires_thermal_packaging: false,
    supports_same_day: false,
    supports_weekend: true,
    default_cost_cents: 1500,
    default_lead_time_days: 2,
    default_cutoff_hour: 14,
    has_tracking: true,
    sort_order: 40,
    allowed_categories: ["dry_goods", "voucher", "gift_card"],
  },
  {
    code: "third_party_glovo",
    name: "Glovo — dostawa dziś",
    description: "Tylko teraz, w okolicy. Dynamiczny koszt zależny od dystansu.",
    requires_thermal_packaging: false,
    supports_same_day: true,
    supports_weekend: true,
    default_cost_cents: 1900,
    default_lead_time_days: 0,
    default_cutoff_hour: 19,
    has_tracking: true,
    sort_order: 50,
  },
  {
    code: "local_courier_manual",
    name: "Kurier lokalny (zlecenie ręczne)",
    description: "Beskidy, Cieszyn, Żywiec — zlecamy lokalnemu kurierowi.",
    requires_thermal_packaging: true,
    supports_same_day: false,
    supports_weekend: true,
    default_cost_cents: 3500,
    default_lead_time_days: 1,
    default_cutoff_hour: 14,
    has_tracking: false,
    sort_order: 60,
  },
]

export default async function seedDeliveryMethods({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const svc = container.resolve("delivery_methods") as any
  for (const m of METHODS) {
    const [existing] = await svc.listAndCountDeliveryMethods({ code: m.code }, { take: 1 })
    if (existing?.length) {
      logger.info(`[seed-methods] skip ${m.code} (already exists)`)
      continue
    }
    await svc.createDeliveryMethods(m)
    logger.info(`[seed-methods] +${m.code}`)
  }
  logger.info("[seed-methods] done")
}
