import { model } from "@medusajs/framework/utils"

/**
 * cs.subscriptions — recurring lunch/box delivery commitments.
 * Customer signs up for e.g. "Lunch dnia Pn-Pt" at fixed price/month.
 * BullMQ cron job generates orders 24h before each delivery.
 */
export const Subscription = model.define(
  { name: "Subscription", tableName: "cs.subscriptions" },
  {
    id: model.id().primaryKey(),
    customer_id: model.text().searchable(),

    // Plan
    plan_code: model.text(), // "lunch-5w" | "box-weekly" | "dessert-friday"
    plan_name: model.text(),

    // Cadence — RRULE-like simplified
    frequency: model.enum(["daily", "weekly", "biweekly", "monthly"]).default("weekly"),
    weekdays: model.json().nullable(), // [1,2,3,4,5] = mon-fri
    delivery_time_slot: model.text().nullable(), // "12:00-14:00"

    // Pricing
    price_cents_per_period: model.number(),
    discount_pct: model.number().default(15), // baked-in subscription discount

    // Items snapshot — what gets delivered each cycle
    items: model.json(), // [{ product_id, qty, name }]

    // Delivery
    address_snapshot: model.json(), // street, city, postcode, phone, floor
    delivery_zone_id: model.text().nullable(),

    // Lifecycle
    status: model.enum(["active", "paused", "cancelled"]).default("active"),
    paused_until: model.dateTime().nullable(),
    started_at: model.dateTime(),
    ended_at: model.dateTime().nullable(),
    next_run_at: model.dateTime(),
    last_run_at: model.dateTime().nullable(),

    // Stripe — recurring payment
    stripe_subscription_id: model.text().nullable(),
    stripe_customer_id: model.text().nullable(),
  }
)
