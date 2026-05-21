import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { renderOrderDelivered } from "../emails/templates"

export default async function orderDeliveredHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderService = container.resolve(Modules.ORDER) as any
  const notify = container.resolve(Modules.NOTIFICATION) as any
  const logger = container.resolve("logger") as any

  try {
    const order = await orderService.retrieveOrder(data.id, { relations: ["shipping_address"] })
    if (!order?.email) return
    const customerName = (order as any).shipping_address?.first_name ?? "Kliencie"
    const orderRef = order.display_id ? `CS-${order.display_id}` : order.id
    const { subject, html } = renderOrderDelivered({
      orderId: orderRef,
      customerName,
      reviewUrl: `${process.env.STOREFRONT_URL}/konto/zamowienia/${order.id}?review=1`,
    })
    await notify.createNotifications({
      to: order.email,
      channel: "email",
      template: "order-delivered",
      data: { subject, html },
    })
    logger.info(`[email] delivered sent for ${order.id}`)
  } catch (err: any) {
    logger.error(`delivered email failed: ${err.message}`)
  }
}

export const config: SubscriberConfig = {
  event: ["order.delivery_completed", "fulfillment.delivery_created"],
}
