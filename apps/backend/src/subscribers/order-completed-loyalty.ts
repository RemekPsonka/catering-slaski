import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { LOYALTY_MODULE } from "../modules/loyalty"

/**
 * On order.completed (delivered + paid):
 *   - Award loyalty points = floor(total_pln) for the customer
 *   - Idempotent by order_id (loyalty service checks transaction history)
 *
 * Order completion is the right moment, not order.placed — we don't reward
 * canceled or refunded orders.
 */
export default async function orderCompletedLoyaltyHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderModuleService = container.resolve(Modules.ORDER)
  const loyaltyService = container.resolve(LOYALTY_MODULE) as any
  const logger = container.resolve("logger") as any

  try {
    const order = await orderModuleService.retrieveOrder(data.id, {
      relations: ["customer"],
    })

    if (!order.customer_id) {
      logger.warn(`Order ${data.id} has no customer_id — skipping loyalty earn`)
      return
    }

    if (!Number(order.total) || Number(order.total) <= 0) {
      logger.warn(`Order ${data.id} has zero total — skipping loyalty earn`)
      return
    }

    const result = await loyaltyService.earnFromOrder(
      order.customer_id,
      order.id,
      Math.round((Number(order.total) || 0) * 100) // Medusa total is in major units
    )

    logger.info(
      `Loyalty earn: order=${order.id} customer=${order.customer_id} points=${result.points_delta}`
    )
  } catch (err) {
    logger.error(`Loyalty earn failed for order ${data.id}: ${(err as Error).message}`)
    // Do NOT re-throw — loyalty failure should not block order completion.
  }
}

export const config: SubscriberConfig = {
  event: "order.completed",
}
