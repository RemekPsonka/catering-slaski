import { MedusaContainer } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { renderAbandonedCart } from "../emails/templates"

/**
 * Daily job: find carts inactive >2h (and <48h), that have items + email,
 * never received recovery email, and send one with a 10% one-shot code.
 *
 * Heuristics — keep simple, tune later:
 *   - cart.completed_at IS NULL (not converted)
 *   - cart.updated_at < now() - 2h
 *   - cart.updated_at > now() - 48h
 *   - cart.email IS NOT NULL
 *   - cart.metadata.recovery_sent != true
 *   - line items count > 0
 */
export default async function abandonedCartJob(container: MedusaContainer) {
  const cartService = container.resolve(Modules.CART) as any
  const notify = container.resolve(Modules.NOTIFICATION) as any
  const logger = container.resolve("logger") as any
  const storefront = process.env.STOREFRONT_URL || "https://cateringslaski.pl"

  const now = Date.now()
  const minAge = now - 2 * 60 * 60 * 1000
  const maxAge = now - 48 * 60 * 60 * 1000

  try {
    const [carts] = await cartService.listAndCountCarts(
      {},
      { take: 200, relations: ["items"] },
    )
    let sent = 0
    for (const c of carts) {
      if (c.completed_at) continue
      if (!c.email) continue
      if ((c.metadata as any)?.recovery_sent) continue
      const u = new Date(c.updated_at ?? c.created_at).getTime()
      if (u > minAge || u < maxAge) continue
      if (!c.items?.length) continue

      const total = Number(c.total ?? 0)
      const customerName =
        c.shipping_address?.first_name ?? c.email.split("@")[0] ?? "Kliencie"

      const { subject, html } = renderAbandonedCart({
        customerName,
        itemsCount: c.items.length,
        total_cents: Math.round(total * 100),
        resumeUrl: `${storefront}/koszyk?cart=${c.id}`,
        discountCode: "POWROT10",
      })
      await notify.createNotifications({
        to: c.email,
        channel: "email",
        template: "abandoned-cart",
        data: { subject, html },
      })
      await cartService.updateCarts({
        id: c.id,
        metadata: { ...(c.metadata ?? {}), recovery_sent: true, recovery_sent_at: new Date().toISOString() },
      })
      sent++
    }
    logger.info(`[job] abandoned-cart-recover: ${sent} sent`)
  } catch (err: any) {
    logger.error(`abandoned-cart job failed: ${err.message}`)
  }
}

export const config = {
  name: "abandoned-cart-recover",
  schedule: "0 17 * * *", // daily at 17:00 — after cutoff
}
