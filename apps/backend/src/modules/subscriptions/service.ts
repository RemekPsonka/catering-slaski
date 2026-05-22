// @ts-nocheck
import { MedusaService } from "@medusajs/framework/utils"
import { Subscription } from "./models/subscription"

type CreateSubscriptionInput = {
  customer_id: string
  plan_code: string
  plan_name: string
  frequency: "daily" | "weekly" | "biweekly" | "monthly"
  weekdays?: number[]
  delivery_time_slot?: string
  price_cents_per_period: number
  items: Array<{ product_id: string; qty: number; name: string }>
  address_snapshot: Record<string, any>
  delivery_zone_id?: string
  stripe_subscription_id?: string
  stripe_customer_id?: string
}

class SubscriptionsService extends MedusaService({
  Subscription,
}) {
  /**
   * Create a new subscription with computed next_run_at.
   */
  async createSubscription(input: CreateSubscriptionInput) {
    const now = new Date()
    const nextRun = this.computeNextRunAt(now, input.frequency, input.weekdays)

    // @ts-ignore

    return this.createSubscriptions({
      ...input,
      started_at: now,
      next_run_at: nextRun,
      status: "active",
    })
  }

  /**
   * Compute the next delivery date based on frequency and weekday rules.
   * For weekly/Pn-Pt: returns next Monday-Friday at the appointed slot.
   */
  computeNextRunAt(from: Date, frequency: string, weekdays?: number[] | null): Date {
    const d = new Date(from)
    d.setHours(0, 0, 0, 0)

    if (frequency === "daily") {
      d.setDate(d.getDate() + 1)
      return d
    }

    if (frequency === "weekly" && weekdays && weekdays.length > 0) {
      const sortedDays = [...weekdays].sort((a, b) => a - b)
      const todayDow = d.getDay() === 0 ? 7 : d.getDay() // 1-7, mon=1
      const nextDow = sortedDays.find((dow) => dow > todayDow) ?? sortedDays[0]
      const daysToAdd = nextDow > todayDow ? nextDow - todayDow : 7 - todayDow + nextDow
      d.setDate(d.getDate() + daysToAdd)
      return d
    }

    if (frequency === "biweekly") {
      d.setDate(d.getDate() + 14)
      return d
    }

    if (frequency === "monthly") {
      d.setMonth(d.getMonth() + 1)
      return d
    }

    // default: +7 days
    d.setDate(d.getDate() + 7)
    return d
  }

  /**
   * Pause subscription until a given date.
   */
  async pause(subscriptionId: string, untilDate?: Date) {
    return this.updateSubscriptions({
      id: subscriptionId,
      status: "paused",
      paused_until: untilDate ?? null,
    })
  }

  /**
   * Resume paused subscription — clears paused_until, recomputes next_run_at.
   */
  async resume(subscriptionId: string) {
    const [sub] = await this.listSubscriptions({ id: subscriptionId }, { take: 1 })
    if (!sub) throw new Error("Subscription not found")

    const nextRun = this.computeNextRunAt(new Date(), sub.frequency, sub.weekdays as unknown as number[] | null)

    return this.updateSubscriptions({
      id: subscriptionId,
      status: "active",
      paused_until: null,
      next_run_at: nextRun,
    })
  }

  async cancel(subscriptionId: string) {
    return this.updateSubscriptions({
      id: subscriptionId,
      status: "cancelled",
      ended_at: new Date(),
    })
  }

  /**
   * Find subscriptions ready to generate orders (next_run_at <= now+24h, active).
   * Called by BullMQ cron every hour.
   */
  async findDueSubscriptions(): Promise<any[]> {
    const cutoff = new Date(Date.now() + 24 * 60 * 60 * 1000)
    return this.listSubscriptions(
      {
        status: "active",
        next_run_at: { $lte: cutoff },
      },
      { take: 200 }
    )
  }

  /**
   * Mark a subscription as run + advance next_run_at.
   */
  async markRun(subscriptionId: string) {
    const [sub] = await this.listSubscriptions({ id: subscriptionId }, { take: 1 })
    if (!sub) return null

    const nextRun = this.computeNextRunAt(
      sub.next_run_at as Date,
      sub.frequency,
      sub.weekdays as unknown as number[] | null
    )

    return this.updateSubscriptions({
      id: subscriptionId,
      last_run_at: new Date(),
      next_run_at: nextRun,
    })
  }
}

export default SubscriptionsService
