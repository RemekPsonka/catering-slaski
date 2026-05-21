import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { renderPaymentCaptured } from "../emails/templates"

/**
 * On payment.captured (Stripe charge succeeded):
 *   - render PaymentCaptured email
 *   - send via Resend
 *
 * Fire-and-forget: never block payment flow.
 */
export default async function paymentCapturedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderService = container.resolve(Modules.ORDER) as any
  const notify = container.resolve(Modules.NOTIFICATION) as any
  const logger = container.resolve("logger") as any

  try {
    const order = await orderService.retrieveOrder(data.id, { relations: ["shipping_address"] })
    if (!order?.email) return

    const amount = Math.round((Number(order.total) || 0) * 100)
    const customerName = (order as any).shipping_address?.first_name ?? "Kliencie"
    const orderRef = order.display_id ? `CS-${order.display_id}` : order.id

    const { subject, html } = renderPaymentCaptured({
      orderId: orderRef,
      customerName,
      amountPaid_cents: amount,
      method: ((order as any).payment_collections?.[0]?.payment_sessions?.[0]?.provider_id ?? "BLIK").toString(),
    })
    await notify.createNotifications({
      to: order.email,
      channel: "email",
      template: "payment-captured",
      data: { subject, html },
    })
    logger.info(`[email] payment.captured sent for ${order.id}`)
  } catch (err: any) {
    logger.error(`payment.captured email failed: ${err.message}`)
  }
}

export const config: SubscriberConfig = {
  event: "payment.captured",
}
