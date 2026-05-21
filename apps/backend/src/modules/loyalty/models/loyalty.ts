import { model } from "@medusajs/framework/utils"

/**
 * cs.loyalty_accounts — per-customer points balance + tier.
 * Earned on every paid order: 1 pkt = 1 zł spent (configurable).
 * Tiers: Brąz (0+), Srebro (1000+), Złoto (1500+), Diament (5000+).
 */
export const LoyaltyAccount = model.define(
  { name: "LoyaltyAccount", tableName: "cs.loyalty_accounts" },
  {
    id: model.id().primaryKey(),
    customer_id: model.text().searchable().unique(),

    points_balance: model.number().default(0),
    points_lifetime: model.number().default(0), // for tier calculation

    tier: model.enum(["bronze", "silver", "gold", "diamond"]).default("bronze"),
    tier_progress_pct: model.number().default(0),

    referral_code: model.text().unique().nullable(),
    referred_by_customer_id: model.text().nullable(),

    last_activity_at: model.dateTime().nullable(),
  }
)

/**
 * cs.loyalty_transactions — append-only ledger of point changes.
 */
export const LoyaltyTransaction = model.define(
  { name: "LoyaltyTransaction", tableName: "cs.loyalty_transactions" },
  {
    id: model.id().primaryKey(),
    customer_id: model.text().searchable(),

    points_delta: model.number(), // positive = earned, negative = redeemed
    reason: model.enum(["order_earn", "redeem", "referral_bonus", "manual_adjust", "expired"]),
    order_id: model.text().nullable(),
    note: model.text().nullable(),
  }
)
