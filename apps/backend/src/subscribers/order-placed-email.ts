import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { renderOrderConfirmation } from "../emails/templates"

/**
 * On order.placed:
 *   - Render order confirmation email
 *   - Send via Resend (or whatever notification provider is wired)
 *
 * Fire-and-forget: failure must NOT block order — just log and move on.
 */
export default async function orderPlacedEmailHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderModuleService = container.resolve(Modules.ORDER)
  const notificationService = container.resolve(Modules.NOTIFICATION)
  const logger = container.resolve("logger") as any

  try {
    const order = await orderModuleService.retrieveOrder(data.id, {
      relations: ["items", "shipping_address"],
    })

    if (!order.email) {
      logger.warn(`Order ${data.id} has no email — skipping confirmation`)
      return
    }

    const addressLines = [
      order.shipping_address?.address_1,
      [order.shipping_address?.postal_code, order.shipping_address?.city].filter(Boolean).join(" "),
    ].filter(Boolean).join(", ")

    const items = (order.items ?? []).map((i: any) => ({
      name: i.title ?? "Pozycja",
      qty: i.quantity ?? 1,
      total_cents: Math.round((i.subtotal ?? 0) * 100),
    }))

    const { subject, html } = renderOrderConfirmation({
      orderId: order.display_id ? `CS-${order.display_id}` : order.id,
      customerName: order.shipping_address?.first_name ?? "Kliencie",
      items,
      subtotal_cents: Math.round((order.subtotal ?? 0) * 100),
      delivery_cents: Math.round((order.shipping_total ?? 0) * 100),
      total_cents: Math.round((order.total ?? 0) * 100),
      delivery_date: (order.metadata as any)?.delivery_date ?? "termin do uzgodnienia",
      delivery_slot: (order.metadata as any)?.delivery_slot ?? "",
      address: addressLines,
      trackingUrl: `${process.env.STOREFRONT_URL}/konto/zamowienia/${order.id}`,
    })

    await notificationService.createNotifications({
      to: order.email,
      channel: "email",
      template: "order-confirmation",
      data: { subject, html },
    })

    logger.info(`[email] order.placed confirmation sent for ${order.id}`)
  } catch (err) {
    logger.error(`order.placed email failed for ${data.id}: ${(err as Error).message}`)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
