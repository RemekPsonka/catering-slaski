import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import Stripe from "stripe"

/**
 * Stripe webhook receiver
 *
 * URL: https://api.cateringslaski.pl/hooks/payment/stripe
 *
 * Events obsługiwane:
 *  - payment_intent.succeeded → trigger order.paid w Medusa
 *  - payment_intent.payment_failed → mark cart payment_failed
 *  - charge.refunded → trigger order.refunded
 *  - customer.subscription.* → update subscription state
 *  - invoice.payment_failed → notify customer, mark subscription past_due
 *
 * Verification:
 *  - HMAC sig via Stripe constructEvent (uses STRIPE_WEBHOOK_SECRET)
 *  - raw body required — nie używaj express.json() przed tym handlerem
 *
 * Idempotency:
 *  - każdy event ma stripe event.id — sprawdzamy w stripe_event_log table
 *  - duplicate event = 200 OK bez side effects
 */

const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: "2025-02-24.acacia",
})

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET not configured")
    return res.status(500).json({ error: "Webhook not configured" })
  }

  const signature = req.headers["stripe-signature"] as string
  if (!signature) {
    return res.status(400).json({ error: "Missing stripe-signature header" })
  }

  let event: Stripe.Event
  try {
    // req.rawBody MUSI być Buffer/string — patrz src/api/middlewares.ts.
    // Fallback JSON.stringify usunięty: nie odtwarza bajt-po-bajt oryginalnego payloadu,
    // więc HMAC signature się zawsze rozjedzie (typowe pole order pól w JSON.stringify ≠ kolejność na wirze Stripe).
    const rawBody = (req as any).rawBody
    if (!rawBody) {
      console.error("[stripe-webhook] rawBody missing — middleware misconfigured")
      return res.status(500).json({ error: "Webhook misconfigured: raw body unavailable" })
    }
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err: any) {
    console.error(`[stripe-webhook] Signature verification failed: ${err.message}`)
    return res.status(400).json({ error: `Webhook signature invalid: ${err.message}` })
  }

  // Idempotency check
  const knex = (req.scope.resolve as any)("__pg_connection__") ||
               (req.scope as any).manager.getConnection().getKnex()

  const seen = await knex.raw(
    `SELECT event_id FROM stripe_event_log WHERE event_id = ?`,
    [event.id]
  )
  if (seen.rows.length > 0) {
    console.log(`[stripe-webhook] Duplicate event ${event.id}, returning 200`)
    return res.status(200).json({ received: true, duplicate: true })
  }

  // Log event
  await knex.raw(
    `INSERT INTO stripe_event_log (event_id, event_type, payload, received_at)
     VALUES (?, ?, ?::jsonb, now())
     ON CONFLICT (event_id) DO NOTHING`,
    [event.id, event.type, JSON.stringify(event)]
  )

  // Dispatch
  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent, req.scope)
        break

      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent, req.scope)
        break

      case "charge.refunded":
        await handleChargeRefunded(event.data.object as Stripe.Charge, req.scope)
        break

      case "charge.dispute.created":
        await handleDisputeCreated(event.data.object as Stripe.Dispute, req.scope)
        break

      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, req.scope)
        break

      case "customer.subscription.deleted":
        await handleSubscriptionCanceled(event.data.object as Stripe.Subscription, req.scope)
        break

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice, req.scope)
        break

      default:
        console.log(`[stripe-webhook] Unhandled event type: ${event.type}`)
    }

    // Mark processed
    await knex.raw(
      `UPDATE stripe_event_log SET processed_at = now(), result = 'success' WHERE event_id = ?`,
      [event.id]
    )

    return res.status(200).json({ received: true })
  } catch (err: any) {
    console.error(`[stripe-webhook] Handler failed for ${event.type}:`, err)
    await knex.raw(
      `UPDATE stripe_event_log SET processed_at = now(), result = 'error', error_message = ? WHERE event_id = ?`,
      [err.message?.substring(0, 500), event.id]
    )
    // Return 5xx so Stripe retries
    return res.status(500).json({ error: "Handler failed" })
  }
}

// ---- Handlers ----

async function handlePaymentSucceeded(pi: Stripe.PaymentIntent, scope: any) {
  const cartId = pi.metadata?.cart_id
  if (!cartId) {
    console.warn(`[stripe-webhook] payment_intent.succeeded without cart_id metadata: ${pi.id}`)
    return
  }

  const cartService = scope.resolve(Modules.CART)
  const paymentService = scope.resolve(Modules.PAYMENT)

  // Confirm payment in Medusa
  await paymentService.capturePayment({
    payment_id: pi.id,
    captured_by: "stripe-webhook",
  } as any)

  // Trigger order placement workflow (handled by Medusa subscriber on payment.captured)
  console.log(`[stripe-webhook] Payment captured for cart ${cartId} (PI: ${pi.id})`)
}

async function handlePaymentFailed(pi: Stripe.PaymentIntent, scope: any) {
  const cartId = pi.metadata?.cart_id
  console.warn(`[stripe-webhook] payment_intent.payment_failed for cart ${cartId} (PI: ${pi.id}): ${pi.last_payment_error?.message}`)

  // TODO: release time slot reservation
  if (cartId) {
    const timeSlotsService = scope.resolve("time_slots") as any
    await timeSlotsService.releaseReservation(cartId)
  }
}

async function handleChargeRefunded(charge: Stripe.Charge, scope: any) {
  const orderId = charge.metadata?.order_id || charge.payment_intent
  console.log(`[stripe-webhook] charge.refunded for order ${orderId}, amount ${charge.amount_refunded}`)

  // TODO: emit order.refunded event → dispatch webhook to billing system
  // Medusa Order module marks as refunded
}

async function handleDisputeCreated(dispute: Stripe.Dispute, scope: any) {
  console.error(`[stripe-webhook] ⚠ DISPUTE created: ${dispute.id}, amount ${dispute.amount}, reason: ${dispute.reason}`)
  // TODO: notify ops via email + Slack
}

async function handleSubscriptionUpdated(sub: Stripe.Subscription, scope: any) {
  const knex = scope.manager.getConnection().getKnex()
  await knex.raw(
    `UPDATE subscriptions
     SET stripe_subscription_id = ?,
         status = ?,
         updated_at = now()
     WHERE stripe_customer_id = ?`,
    [sub.id, mapStripeStatusToInternal(sub.status), sub.customer]
  )
}

async function handleSubscriptionCanceled(sub: Stripe.Subscription, scope: any) {
  const knex = scope.manager.getConnection().getKnex()
  await knex.raw(
    `UPDATE subscriptions
     SET status = 'canceled',
         canceled_at = now(),
         updated_at = now()
     WHERE stripe_subscription_id = ?`,
    [sub.id]
  )
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice, scope: any) {
  const knex = scope.manager.getConnection().getKnex()
  await knex.raw(
    `UPDATE subscriptions SET status = 'past_due', updated_at = now()
     WHERE stripe_subscription_id = ?`,
    [(invoice as any).subscription]
  )
  console.warn(`[stripe-webhook] Subscription payment failed: ${(invoice as any).subscription}`)
  // TODO: email customer with payment retry link
}

function mapStripeStatusToInternal(stripeStatus: string): string {
  const map: Record<string, string> = {
    active: "active",
    past_due: "past_due",
    canceled: "canceled",
    unpaid: "past_due",
    paused: "paused",
    trialing: "active",
    incomplete: "past_due",
    incomplete_expired: "canceled",
  }
  return map[stripeStatus] || "active"
}
