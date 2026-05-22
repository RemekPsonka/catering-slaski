import { MedusaService } from "@medusajs/framework/utils"
import { LoyaltyAccount, LoyaltyTransaction } from "./models/loyalty"
import { randomBytes } from "node:crypto"

const TIERS: Array<{ name: "bronze" | "silver" | "gold" | "diamond"; threshold: number }> = [
  { name: "bronze",     threshold: 0 },
  { name: "silver",   threshold: 1000 },
  { name: "gold",    threshold: 1500 },
  { name: "diamond",  threshold: 5000 },
]

const POINTS_PER_PLN = 1 // 1 punkt = 1 zł wydany

class LoyaltyService extends MedusaService({
  LoyaltyAccount,
  LoyaltyTransaction,
}) {
  /**
   * Get or create loyalty account for a customer.
   */
  async getOrCreateAccount(customerId: string) {
    const existing = await this.listLoyaltyAccounts({ customer_id: customerId }, { take: 1 })
    if (existing.length > 0) return existing[0]

    const referralCode = `CS-${randomBytes(3).toString("hex").toUpperCase()}`
    return this.createLoyaltyAccounts({
      customer_id: customerId,
      referral_code: referralCode,
    })
  }

  /**
   * Earn points on a paid order. Idempotent by order_id.
   */
  async earnFromOrder(customerId: string, orderId: string, orderTotalCents: number) {
    // idempotency check
    const existing = await this.listLoyaltyTransactions(
      { customer_id: customerId, order_id: orderId, reason: "order_earn" },
      { take: 1 }
    )
    if (existing.length > 0) return existing[0]

    const account = await this.getOrCreateAccount(customerId)
    const pointsEarned = Math.floor((orderTotalCents / 100) * POINTS_PER_PLN)

    const newBalance = account.points_balance + pointsEarned
    const newLifetime = account.points_lifetime + pointsEarned
    const { tier, progressPct } = this.computeTier(newLifetime)

    await this.updateLoyaltyAccounts({
      id: account.id,
      points_balance: newBalance,
      points_lifetime: newLifetime,
      tier,
      tier_progress_pct: progressPct,
      last_activity_at: new Date(),
    })

    return this.createLoyaltyTransactions({
      customer_id: customerId,
      points_delta: pointsEarned,
      reason: "order_earn",
      order_id: orderId,
      note: `Zamówienie ${orderId} — ${(orderTotalCents / 100).toFixed(0)} zł`,
    })
  }

  /**
   * Redeem points for a reward. Throws if insufficient balance.
   */
  async redeem(customerId: string, points: number, note?: string) {
    const account = await this.getOrCreateAccount(customerId)
    if (account.points_balance < points) {
      throw new Error(`Insufficient points: have ${account.points_balance}, need ${points}`)
    }

    const newBalance = account.points_balance - points

    await this.updateLoyaltyAccounts({
      id: account.id,
      points_balance: newBalance,
      last_activity_at: new Date(),
    })

    return this.createLoyaltyTransactions({
      customer_id: customerId,
      points_delta: -points,
      reason: "redeem",
      note: note ?? `Wymiana ${points} pkt`,
    })
  }

  /**
   * Award referral bonus when a referred friend's first order completes.
   */
  async referralBonus(referrerCustomerId: string, referredCustomerId: string) {
    const REFERRAL_BONUS_POINTS = 200
    const account = await this.getOrCreateAccount(referrerCustomerId)

    const newBalance = account.points_balance + REFERRAL_BONUS_POINTS
    const newLifetime = account.points_lifetime + REFERRAL_BONUS_POINTS

    await this.updateLoyaltyAccounts({
      id: account.id,
      points_balance: newBalance,
      points_lifetime: newLifetime,
      last_activity_at: new Date(),
    })

    return this.createLoyaltyTransactions({
      customer_id: referrerCustomerId,
      points_delta: REFERRAL_BONUS_POINTS,
      reason: "referral_bonus",
      note: `Polecenie ${referredCustomerId}`,
    })
  }

  /**
   * Compute tier name and progress percent toward next tier.
   */
  computeTier(lifetimePoints: number): { tier: "bronze" | "silver" | "gold" | "diamond"; progressPct: number } {
    let current = TIERS[0]
    let next = TIERS[1]
    for (let i = 0; i < TIERS.length; i++) {
      if (lifetimePoints >= TIERS[i].threshold) {
        current = TIERS[i]
        next = TIERS[i + 1] ?? TIERS[i]
      }
    }
    if (current === next) return { tier: current.name, progressPct: 100 }
    const span = next.threshold - current.threshold
    const progress = ((lifetimePoints - current.threshold) / span) * 100
    return { tier: current.name, progressPct: Math.min(100, Math.max(0, Math.round(progress))) }
  }

  /**
   * Transaction history for a customer.
   */
  async listHistory(customerId: string, limit = 50) {
    return this.listLoyaltyTransactions(
      { customer_id: customerId },
      { take: limit, order: { created_at: "DESC" } }
    )
  }
}

export default LoyaltyService
