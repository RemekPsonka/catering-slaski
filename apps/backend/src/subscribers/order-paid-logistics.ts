import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { EXTERNAL_WEBHOOKS_MODULE } from "../modules/external-webhooks"

/**
 * Subscriber: order.paid → webhook do systemu logistyki
 *
 * Wysyła po opłaceniu (nie wcześniej — nie ma sensu planować trasy gdy
 * płatność może się nie powieść).
 */
export default async function orderPaidLogistics({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderId = event.data.id

  const orderService = container.resolve(Modules.ORDER)
  const externalWebhooks = container.resolve(EXTERNAL_WEBHOOKS_MODULE) as any
  const knex = (container as any).manager?.getConnection().getKnex()

  const order = await orderService.retrieveOrder(orderId, {
    relations: ["items", "shipping_address", "customer"],
  })

  if ((order as any).payment_status !== "captured" && (order as any).payment_status !== "authorized") {
    return  // tylko opłacone
  }

  const metaResult = await knex.raw(
    `SELECT * FROM order_catering_metadata WHERE order_id = ?`,
    [orderId]
  )
  const meta = metaResult.rows[0]
  if (!meta) return

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

  // Estimate packages from line items
  const packagesResult = await knex.raw(
    `
    SELECT
      pca.packaging_type,
      pca.temperature_constraint,
      COUNT(*) AS count
    FROM order_item oi
    JOIN product_catering_attributes pca ON pca.product_id = oi.product_id
    WHERE oi.order_id = ?
    GROUP BY pca.packaging_type, pca.temperature_constraint
    `,
    [orderId]
  )
  const packages = packagesResult.rows.map((r: any) => ({
    package_type: r.packaging_type,
    count: parseInt(r.count, 10),
    temperature_constraint: r.temperature_constraint,
  }))

  // Calculate pickup window (1h-2h before delivery slot)
  const deliveryStart = new Date(`${slot.slot_date}T${slot.time_from}+02:00`)
  const pickupFrom = new Date(deliveryStart.getTime() - 3 * 60 * 60 * 1000)
  const pickupTo = new Date(deliveryStart.getTime() - 1.5 * 60 * 60 * 1000)

  const isCourier = zone.delivery_method.startsWith("courier")

  const payload: any = {
    event_id: `evt_${crypto.randomUUID()}`,
    event_type: "order.paid",
    event_timestamp: new Date().toISOString(),
    webhook_version: "1",

    order: {
      id: order.id,
      display_number: `CS-${new Date().getFullYear()}-${((order as any).display_id || 0).toString().padStart(5, "0")}`,
      paid_at: (order as any).captured_at || new Date().toISOString(),
    },

    delivery_request: {
      type: isCourier ? "courier" : "own_fleet",
      requested_date: slot.slot_date,
      time_slot: {
        id: slot.id,
        from: slot.time_from,
        to: slot.time_to,
      },
      zone: {
        id: zone.id,
        name: zone.name,
        priority: zone.priority,
      },
      ...(isCourier && {
        preferred_courier: zone.delivery_method.replace("courier_", ""),
        service_level: "standard",
      }),
    },

    pickup_location: {
      type: "hq",
      address: {
        street: "Marcina Kasprzaka 256",
        city: "Dąbrowa Górnicza",
        postal_code: "41-303",
        lat: 50.3217,
        lng: 19.2014,
      },
      available_from: pickupFrom.toISOString(),
      available_until: pickupTo.toISOString(),
    },

    delivery_location: {
      address: {
        first_name: order.shipping_address?.first_name,
        last_name: order.shipping_address?.last_name,
        street: order.shipping_address?.address_1,
        city: order.shipping_address?.city,
        postal_code: order.shipping_address?.postal_code,
        country_code: order.shipping_address?.country_code,
        lat: meta.delivery_address_lat,
        lng: meta.delivery_address_lng,
      },
      contact: {
        email: order.email,
        phone: order.shipping_address?.phone || (order.customer as any)?.phone,
      },
      delivery_instructions: meta.delivery_instructions,
      preferred_arrival_window: {
        earliest: deliveryStart.toISOString(),
        latest: new Date(`${slot.slot_date}T${slot.time_to}+02:00`).toISOString(),
      },
    },

    packages_estimated: packages,
    package_count_estimated: packages.reduce((sum: number, p: any) => sum + p.count, 0),
    estimated_weight_kg: packages.reduce((sum: number, p: any) => sum + p.count * 2.5, 0),

    customer_can_receive: {
      alternative_phone: null,
      leave_at_door: false,
      signature_required: false,
    },
  }

  await externalWebhooks.dispatch({
    destination: "logistics",
    event_id: payload.event_id,
    event_type: "order.paid",
    payload,
  })
}

export const config: SubscriberConfig = {
  event: "order.paid",
  context: {
    subscriberId: "order-paid-logistics",
  },
}
