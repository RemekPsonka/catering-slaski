import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { EXTERNAL_WEBHOOKS_MODULE } from "../modules/external-webhooks"

/**
 * Subscriber: order.placed → webhook do system produkcji
 *
 * Wysyła zamówienie do KDS produkcji żeby kuchnia mogła zacząć planować.
 * Trigger niezależnie od stanu płatności — kuchnia chce wczesny sygnał.
 */
export default async function orderPlacedProduction({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderId = event.data.id

  const orderService = container.resolve(Modules.ORDER)
  const productService = container.resolve(Modules.PRODUCT)
  const customerService = container.resolve(Modules.CUSTOMER)
  const cateringAttrs = container.resolve("catering_attributes" as any)
  const externalWebhooks = container.resolve(EXTERNAL_WEBHOOKS_MODULE) as any
  const knex = (container.resolve("__pg_connection__" as any) as any) ||
               (container as any).manager?.getConnection().getKnex()

  // Fetch order with relations
  const order = await orderService.retrieveOrder(orderId, {
    relations: ["items", "shipping_address", "customer"],
  })

  // Fetch catering metadata (delivery zone, slot, etc.)
  const metaResult = await knex.raw(
    `SELECT * FROM order_catering_metadata WHERE order_id = ?`,
    [orderId]
  )
  const meta = metaResult.rows[0]
  if (!meta) {
    console.warn(`[order.placed/production] No catering metadata for order ${orderId}, skipping`)
    return
  }

  // Fetch zone + slot
  const zoneResult = await knex.raw(
    `SELECT * FROM delivery_zones WHERE id = ?`,
    [meta.delivery_zone_id]
  )
  const zone = zoneResult.rows[0]

  const slotResult = await knex.raw(
    `SELECT * FROM delivery_time_slots WHERE id = ?`,
    [meta.time_slot_id]
  )
  const slot = slotResult.rows[0]

  // Fetch customer preferences
  const prefsResult = await knex.raw(
    `SELECT * FROM customer_preferences WHERE customer_id = ?`,
    [order.customer_id]
  )
  const prefs = prefsResult.rows[0] || {}

  // Build items with catering attributes
  const items = []
  for (const item of order.items || []) {
    const attrResult = await knex.raw(
      `SELECT * FROM product_catering_attributes WHERE product_id = ?`,
      [item.product_id]
    )
    const attrs = attrResult.rows[0] || {}
    items.push({
      product_id: item.product_id,
      sku: (item as any).variant_sku || (item as any).product_handle,
      name: item.title,
      category: attrs.category || "catering_boxes",
      production_lead_time_days: attrs.production_lead_time_days || 1,
      packaging_type: attrs.packaging_type || "wooden_box",
      temperature_constraint: attrs.temperature_constraint || "room_temp",
      portions: attrs.portions_default || 10,
      quantity: item.quantity,
      variant: (item as any).variant_title || null,
      diet_tags: attrs.diet_tags || [],
      allergens: attrs.allergens || [],
      customer_note: item.metadata?.customer_note || null,
    })
  }

  // Build payload (zgodny z SPEC v3 sekcja 10.2)
  const payload = {
    event_id: `evt_${crypto.randomUUID()}`,
    event_type: "order.placed",
    event_timestamp: new Date().toISOString(),
    webhook_version: "1",

    order: {
      id: order.id,
      display_number: `CS-${new Date().getFullYear()}-${(order as any).display_id?.toString().padStart(5, "0") || "00000"}`,
      placed_at: order.created_at,
      source: meta.source || "storefront",
      payment_status: (order as any).payment_status,
      currency: order.currency_code,
    },

    delivery: {
      requested_date: slot.slot_date,
      time_slot: {
        from: slot.time_from,
        to: slot.time_to,
      },
      zone: {
        id: zone.id,
        name: zone.name,
        delivery_method: zone.delivery_method,
      },
      address: {
        first_name: order.shipping_address?.first_name,
        last_name: order.shipping_address?.last_name,
        street: order.shipping_address?.address_1,
        city: order.shipping_address?.city,
        postal_code: order.shipping_address?.postal_code,
        country_code: order.shipping_address?.country_code,
        lat: meta.delivery_address_lat,
        lng: meta.delivery_address_lng,
        delivery_instructions: meta.delivery_instructions,
      },
      contact: {
        email: order.email,
        phone: order.shipping_address?.phone || (order as any).customer?.phone,
      },
    },

    items,

    customer_preferences: {
      diet: prefs.diet || [],
      allergens_avoid: prefs.allergens_avoid || [],
      dislikes: prefs.dislikes || [],
    },

    total_portions_estimated: items.reduce((sum, it) => sum + it.portions * it.quantity, 0),
    preparation_deadline: new Date(
      `${slot.slot_date}T${slot.time_from}+02:00`
    ).getTime() - 60 * 60 * 1000  // 1h before delivery
      ? new Date(new Date(`${slot.slot_date}T${slot.time_from}+02:00`).getTime() - 60 * 60 * 1000).toISOString()
      : null,
  }

  await externalWebhooks.dispatch({
    destination: "production",
    event_id: payload.event_id,
    event_type: "order.placed",
    payload,
  })

  console.log(`[order.placed/production] Dispatched webhook for order ${orderId}`)
}

export const config: SubscriberConfig = {
  event: "order.placed",
  context: {
    subscriberId: "order-placed-production",
  },
}
