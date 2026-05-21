import { model } from "@medusajs/framework/utils"

/**
 * NewsletterSubscriber — RODO double opt-in.
 *
 * Flow:
 *   1. POST /store/newsletter/signup { email, consent } → tworzy z status=pending + token
 *   2. Mail z linkiem /newsletter/confirm?token=...
 *   3. Klient klika → status=confirmed, confirmed_at=now()
 *   4. Mail unsubscribe / kliknięcie → status=unsubscribed
 *
 * GDPR: source + ip + user_agent + consent_text_hash → audit trail.
 */
export const NewsletterSubscriber = model.define("NewsletterSubscriber", {
  id: model.id({ prefix: "ns" }).primaryKey(),
  email: model.text().unique(),
  customer_id: model.text().nullable(),
  status: model
    .enum(["pending", "confirmed", "unsubscribed", "bounced", "complained"])
    .default("pending"),
  confirmation_token: model.text().nullable(),
  token_expires_at: model.dateTime().nullable(),
  confirmed_at: model.dateTime().nullable(),
  unsubscribed_at: model.dateTime().nullable(),
  // Source — gdzie kliknął "zapisz się"
  source: model.text().nullable(), // "homepage_popup", "footer", "checkout_consent"
  // Audit
  consent_ip: model.text().nullable(),
  consent_user_agent: model.text().nullable(),
  consent_text_hash: model.text().nullable(), // SHA-256 wyświetlanej zgody
  // Segmentacja
  tags: model.json().nullable(),
  // Discount code wystawiony przy welcome (jeśli)
  welcome_code: model.text().nullable(),
})
