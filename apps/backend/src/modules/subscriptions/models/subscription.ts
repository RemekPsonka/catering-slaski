import { model } from "@medusajs/framework/utils"

/**
 * cs.subscriptions — recurring lunch/box delivery commitments.
 * Customer signs up for e.g. "Lunch dnia Pn-Pt" at fixed price/month.
 * BullMQ cron job generates orders 24h before each delivery.
 *
 * v2 (2026-05-21): dodane pola control plane: paused_at, skipped_dates,
 * meal_overrides, cancellation_reason, b2b_account_id.
 */
export const Subscription = model.define(
  { name: "Subscription", tableName: "cs.subscriptions" },
  {
    id: model.id().primaryKey(),
    customer_id: model.text().searchable(),
    // Opcjonalnie: subskrypcja należąca do B2B account (np. SmartLunch)
    b2b_account_id: model.text().nullable(),

    // Plan
    plan_code: model.text(),
    plan_name: model.text(),

    // Cadence — RRULE-like simplified
    frequency: model.enum(["daily", "weekly", "biweekly", "monthly"]).default("weekly"),
    weekdays: model.json().nullable(), // [1,2,3,4,5] = mon-fri
    delivery_time_slot: model.text().nullable(),

    // Pricing
    price_cents_per_period: model.number(),
    discount_pct: model.number().default(15),

    // Items snapshot — what gets delivered each cycle
    items: model.json(),

    // Per-day overrides (v2)
    // [{ date: "2026-05-22", original_product_id, replacement_product_id, applied_at }]
    meal_overrides: model.json().nullable(),
    // Skipped dates (v2) - lista "YYYY-MM-DD" które pominąć
    skipped_dates: model.json().nullable(),

    // Delivery
    address_snapshot: model.json(),
    delivery_zone_id: model.text().nullable(),

    // Lifecycle
    status: model.enum(["active", "paused", "cancelled", "expired"]).default("active"),
    paused_at: model.dateTime().nullable(),
    paused_until: model.dateTime().nullable(),
    started_at: model.dateTime(),
    ended_at: model.dateTime().nullable(),
    next_run_at: model.dateTime(),
    last_run_at: model.dateTime().nullable(),
    cancelled_at: model.dateTime().nullable(),
    cancellation_reason: model.text().nullable(),

    // Stripe — recurring payment
    stripe_subscription_id: model.text().nullable(),
    stripe_customer_id: model.text().nullable(),
  }
)
