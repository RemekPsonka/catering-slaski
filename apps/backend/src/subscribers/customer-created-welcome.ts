// @ts-nocheck
import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { renderWelcomeCustomer } from "../emails/templates"

export default async function customerWelcomeHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const customerService = container.resolve(Modules.CUSTOMER) as any
  const notify = container.resolve(Modules.NOTIFICATION) as any
  const logger = container.resolve("logger") as any
  try {
    const customer = await customerService.retrieveCustomer(data.id)
    if (!customer?.email) return
    const firstName = customer.first_name ?? customer.email.split("@")[0]
    const { subject, html } = renderWelcomeCustomer({
      customerName: firstName,
      loginUrl: `${process.env.STOREFRONT_URL}/konto`,
    })
    await notify.createNotifications({
      to: customer.email,
      channel: "email",
      template: "customer-welcome",
      data: { subject, html },
    })
    logger.info(`[email] welcome sent for ${customer.id}`)
  } catch (err: any) {
    logger.error(`welcome email failed: ${err.message}`)
  }
}

export const config: SubscriberConfig = {
  event: "customer.created",
}
