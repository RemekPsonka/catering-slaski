import { MedusaService } from "@medusajs/framework/utils"
import {
  ProductAvailability,
  ProductDailyCount,
} from "./models/product-availability"

class ProductAvailabilityModuleService extends MedusaService({
  ProductAvailability,
  ProductDailyCount,
}) {
  /**
   * Returns true if a product is available on a given date.
   * Pure SQL-less check based on availability rules + daily_count.
   */
  async isAvailableOn(productId: string, date: Date): Promise<{
    available: boolean
    reason?: string
    remaining?: number | null
  }> {
    const [rules] = await (this as any).listAndCountProductAvailabilities(
      { product_id: productId, is_active: true },
      { take: 1 },
    )
    const rule = rules?.[0]
    if (!rule) {
      // Brak reguły = produkt dostępny zawsze
      return { available: true }
    }
    // Sprawdz zakres dat
    if (rule.available_from && date < new Date(rule.available_from)) {
      return { available: false, reason: "before_availability_window" }
    }
    if (rule.available_to && date > new Date(rule.available_to)) {
      return { available: false, reason: "after_availability_window" }
    }
    // Sprawdz dzień tygodnia
    if (Array.isArray(rule.weekdays) && rule.weekdays.length > 0) {
      const dow = date.getDay()
      if (!rule.weekdays.includes(dow)) {
        return { available: false, reason: "not_offered_on_weekday" }
      }
    }
    // Sprawdz daily_limit
    if (rule.daily_limit) {
      const isoDate = date.toISOString().slice(0, 10)
      const [counts] = await (this as any).listAndCountProductDailyCounts(
        { product_id: productId, count_date: isoDate },
        { take: 1 },
      )
      const used = (counts?.[0]?.reserved_quantity ?? 0) + (counts?.[0]?.ordered_quantity ?? 0)
      const remaining = rule.daily_limit - used
      if (remaining <= 0) {
        return { available: false, reason: "daily_limit_reached", remaining: 0 }
      }
      return { available: true, remaining }
    }
    return { available: true }
  }

  /**
   * Increment daily count when an order is placed.
   * Used by subscriber `product-availability-decrement.ts`.
   */
  async incrementOrderedCount(productId: string, date: Date, qty: number) {
    const isoDate = date.toISOString().slice(0, 10)
    const [existing] = (await (this as any).listAndCountProductDailyCounts(
      { product_id: productId, count_date: isoDate },
      { take: 1 },
    )) ?? [[]]
    if (existing?.[0]) {
      return await (this as any).updateProductDailyCounts({
        id: existing[0].id,
        ordered_quantity: (existing[0].ordered_quantity ?? 0) + qty,
      })
    }
    return await (this as any).createProductDailyCounts({
      product_id: productId,
      count_date: isoDate,
      ordered_quantity: qty,
    })
  }
}

export default ProductAvailabilityModuleService
