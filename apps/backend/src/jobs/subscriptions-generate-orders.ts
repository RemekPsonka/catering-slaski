import type { MedusaContainer } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { SUBSCRIPTIONS_MODULE } from "../modules/subscriptions"

/**
 * Hourly cron: find subscriptions due in next 24h, create draft orders,
 * trigger Stripe payment intent off the saved card, advance next_run_at.
 *
 * SAFETY: this is idempotent only if subscription.markRun is called atomically
 * with order creation — for now we accept a tiny window of double-billing risk
 * and instrument with Sentry. Production hardening: wrap in DB transaction.
 */
export default async function subscriptionsGenerateOrdersJob(container: MedusaContainer) {
  const logger = container.resolve("logger") as any
  const subscriptionsService = container.resolve(SUBSCRIPTIONS_MODULE) as any
  const orderModuleService = container.resolve(Modules.ORDER)
  const cartModuleService = container.resolve(Modules.CART)

  const due = await subscriptionsService.findDueSubscriptions()
  logger.info(`[subscriptions-cron] Found ${due.length} due subscriptions`)

  for (const sub of due) {
    try {
      // Skip if paused_until is still in future
      if (sub.paused_until && new Date(sub.paused_until) > new Date()) {
        continue
      }

      // Create draft cart from subscription snapshot
      const cart = await cartModuleService.createCarts({
        customer_id: sub.customer_id,
        email: sub.address_snapshot?.email,
        currency_code: "pln",
        region_id: process.env.DEFAULT_REGION_ID,
        items: (sub.items as Array<{ product_id: string; qty: number }>).map((it) => ({
          variant_id: it.product_id, // assumes single variant; refine for variants
          quantity: it.qty,
        })),
        metadata: {
          subscription_id: sub.id,
          source: "subscription_cron",
        },
      })

      logger.info(`[subscriptions-cron] Created cart ${cart.id} for subscription ${sub.id}`)

      // TODO: trigger Stripe payment intent off saved payment method
      // TODO: complete cart → order
      // TODO: subscriber 'order.placed' will fire production/logistics webhooks

      // Mark sub as run, advance next_run_at
      await subscriptionsService.markRun(sub.id)
    } catch (err) {
      logger.error(`[subscriptions-cron] Failed for subscription ${sub.id}: ${(err as Error).message}`)
      // Do not break the loop — process other subscriptions
    }
  }
}

export const config = {
  name: "subscriptions-generate-orders",
  schedule: "0 * * * *", // every hour
}
