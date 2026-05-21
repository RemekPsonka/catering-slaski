import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { renderOrderShipped } from "../emails/templates"

export default async function orderShippedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string; fulfillment_id?: string }>) {
  const orderService = container.resolve(Modules.ORDER) as any
  const notify = container.resolve(Modules.NOTIFICATION) as any
  const logger = container.resolve("logger") as any

  try {
    const order = await orderService.retrieveOrder(data.id, { relations: ["shipping_address"] })
    if (!order?.email) return
    const customerName = (order as any).shipping_address?.first_name ?? "Kliencie"
    const orderRef = order.display_id ? `CS-${order.display_id}` : order.id
    const meta = (order.metadata ?? {}) as any
    const { subject, html } = renderOrderShipped({
      orderId: orderRef,
      customerName,
      trackingUrl: `${process.env.STOREFRONT_URL}/konto/zamowienia/${order.id}`,
      driverName: meta.driver_name,
      driverPhone: meta.driver_phone,
      etaWindow: meta.delivery_slot,
    })
    await notify.createNotifications({
      to: order.email,
      channel: "email",
      template: "order-shipped",
      data: { subject, html },
    })
    logger.info(`[email] order shipped sent for ${order.id}`)
  } catch (err: any) {
    logger.error(`order shipped email failed: ${err.message}`)
  }
}

export const config: SubscriberConfig = {
  event: ["order.fulfillment_shipped", "fulfillment.shipment_created"],
}
