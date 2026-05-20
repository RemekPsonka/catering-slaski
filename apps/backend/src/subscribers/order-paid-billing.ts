import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { EXTERNAL_WEBHOOKS_MODULE } from "../modules/external-webhooks"

/**
 * Subscriber: order.paid → webhook do systemu rozliczeń (fakturowanie)
 *
 * Wysyła pełen breakdown finansowy: kwoty, VAT 8%, payment details,
 * dane klienta (w tym NIP jeśli faktura VAT requested).
 */
export default async function orderPaidBilling({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderId = event.data.id

  const orderService = container.resolve(Modules.ORDER)
  const externalWebhooks = container.resolve(EXTERNAL_WEBHOOKS_MODULE) as any
  const knex = (container as any).manager?.getConnection().getKnex()

  const order = await orderService.retrieveOrder(orderId, {
    relations: ["items", "shipping_address", "billing_address", "customer", "payment_collections.payments"],
  })

  if (order.payment_status !== "captured") return

  const metaResult = await knex.raw(
    `SELECT * FROM order_catering_metadata WHERE order_id = ?`,
    [orderId]
  )
  const meta = metaResult.rows[0]
  if (!meta) return

  // Get Stripe payment intent ID from payment provider data
  const payment = order.payment_collections?.[0]?.payments?.[0]
  const stripePaymentIntent = (payment?.data as any)?.id || null
  const stripeChargeId = (payment?.data as any)?.charges?.data?.[0]?.id || null

  // Loyalty state for context
  const loyaltyResult = await knex.raw(
    `SELECT current_tier FROM customer_loyalty_state WHERE customer_id = ?`,
    [order.customer_id]
  )
  const loyaltyTier = loyaltyResult.rows[0]?.current_tier || "bronze"

  // Discount breakdown
  const promotionDiscount = (order as any).discount_total_cents || 0
  const promotionCode = (order as any).discount_code || null

  const subtotalCents = (order as any).subtotal || 0
  const taxCents = (order as any).tax_total || 0
  const totalCents = (order as any).total || 0
  const shippingCents = (order as any).shipping_total || 0

  // Build items with VAT breakdown
  const items = (order.items || []).map((item: any) => ({
    product_id: item.product_id,
    sku: item.variant_sku || item.product_handle,
    name: item.title,
    quantity: item.quantity,
    unit_price_cents: item.unit_price,
    subtotal_cents: item.unit_price * item.quantity,
    discount_cents: item.discount_total || 0,
    tax_rate: "8.00",  // catering = food = 8% VAT PL
    tax_cents: item.tax_total || Math.round(item.unit_price * item.quantity * 0.08 / 1.08),
    total_cents: item.total,
    vat_category: "food_8",
  }))

  const payload = {
    event_id: `evt_${crypto.randomUUID()}`,
    event_type: "order.paid",
    event_timestamp: new Date().toISOString(),
    webhook_version: "1",

    order: {
      id: order.id,
      display_number: `CS-${new Date().getFullYear()}-${((order as any).display_id || 0).toString().padStart(5, "0")}`,
      placed_at: order.created_at,
      paid_at: (order as any).captured_at || new Date().toISOString(),
    },

    customer: {
      id: order.customer_id,
      email: order.email,
      phone: order.shipping_address?.phone || (order.customer as any)?.phone,
      first_name: (order.customer as any)?.first_name || order.shipping_address?.first_name,
      last_name: (order.customer as any)?.last_name || order.shipping_address?.last_name,
      is_business: meta.requires_invoice,
      billing_address: {
        street: order.billing_address?.address_1 || order.shipping_address?.address_1,
        city: order.billing_address?.city || order.shipping_address?.city,
        postal_code: order.billing_address?.postal_code || order.shipping_address?.postal_code,
        country_code: order.billing_address?.country_code || "PL",
      },
    },

    invoice_request: {
      requires_invoice: meta.requires_invoice,
      invoice_type: meta.requires_invoice ? "vat" : null,
      nip: meta.invoice_nip,
      company_name: meta.invoice_company_name,
      company_address: meta.requires_invoice ? {
        street: order.billing_address?.address_1,
        city: order.billing_address?.city,
        postal_code: order.billing_address?.postal_code,
        country_code: "PL",
      } : null,
    },

    amounts: {
      currency: order.currency_code || "PLN",
      subtotal_cents: subtotalCents,
      discount_total_cents: promotionDiscount,
      discount_breakdown: promotionDiscount > 0 ? [
        { type: "promo_code", code: promotionCode, amount_cents: promotionDiscount }
      ] : [],
      shipping_cents: shippingCents,
      tax_cents: taxCents,
      tax_breakdown: [
        { rate: "8.00", name: "VAT 8%", amount_cents: taxCents }
      ],
      total_cents: totalCents,
      amount_paid_cents: totalCents,
      amount_outstanding_cents: 0,
    },

    items,

    payment: {
      method: (payment?.data as any)?.payment_method_type || "card",
      provider: "stripe",
      stripe_payment_intent_id: stripePaymentIntent,
      stripe_charge_id: stripeChargeId,
      card_last_4: (payment?.data as any)?.charges?.data?.[0]?.payment_method_details?.card?.last4 || null,
      card_brand: (payment?.data as any)?.charges?.data?.[0]?.payment_method_details?.card?.brand || null,
      blik_code_masked: (payment?.data as any)?.payment_method_type === "blik" ? "******" : null,
      captured_at: (order as any).captured_at || new Date().toISOString(),
      stripe_fee_cents: (payment?.data as any)?.balance_transaction?.fee || null,
    },

    metadata: {
      source: meta.source || "storefront",
      referral_code: meta.referral_code,
      loyalty_points_earned: Math.floor(totalCents / 100),  // 1 pkt per zł
      loyalty_tier_at_purchase: loyaltyTier,
    },
  }

  await externalWebhooks.dispatch({
    destination: "billing",
    event_id: payload.event_id,
    event_type: "order.paid",
    payload,
  })
}

export const config: SubscriberConfig = {
  event: "order.paid",
  context: {
    subscriberId: "order-paid-billing",
  },
}
