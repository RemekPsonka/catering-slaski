// @ts-nocheck
import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { renderB2BLeadReceived } from "../emails/templates"

/**
 * b2b-lead.created → notify the sales mailbox so a human picks it up fast.
 * Payload shape comes from POST /store/b2b-leads.
 */
export default async function b2bLeadHandler({
  event: { data },
  container,
}: SubscriberArgs<any>) {
  const notify = container.resolve(Modules.NOTIFICATION) as any
  const logger = container.resolve("logger") as any
  const adminEmail = process.env.ADMIN_EMAIL || process.env.RESEND_REPLY_TO || "zamowienia@cateringslaski.pl"
  try {
    const { subject, html } = renderB2BLeadReceived({
      company: data.company ?? "—",
      contactName: data.contact_name ?? data.name ?? "—",
      email: data.email ?? "—",
      phone: data.phone,
      briefText: data.brief_text ?? data.message ?? "(brak briefu)",
      estimatedValue: data.estimated_value_cents ?? data.estimated_value ?? undefined,
    })
    await notify.createNotifications({
      to: adminEmail,
      channel: "email",
      template: "b2b-lead-received",
      data: { subject, html },
    })
    logger.info(`[email] b2b-lead admin notification sent`)
  } catch (err: any) {
    logger.error(`b2b-lead email failed: ${err.message}`)
  }
}

export const config: SubscriberConfig = {
  event: "b2b-lead.created",
}
