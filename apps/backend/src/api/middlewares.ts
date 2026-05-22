// @ts-nocheck
import { defineMiddlewares } from "@medusajs/framework/http"

/**
 * Medusa middleware overrides.
 *
 * Webhooks (Stripe + nasze external) MUSZĄ mieć rawBody do HMAC verification.
 * Medusa v2 wystawia req.rawBody automatycznie gdy `bodyParser` ma flagę `preserveRawBody: true`.
 * Brak `body-parser` jako zewn. dep — używamy wbudowanego mechanizmu Medusa.
 *
 * Konwencja:
 *   /hooks/* — preserveRawBody: true  → req.rawBody (Buffer) + req.body (parsed JSON)
 *   wszystko inne — standardowy Medusa parsing
 */
export default defineMiddlewares({
  routes: [
    {
      matcher: "/hooks/payment/stripe",
      method: "POST",
      bodyParser: { preserveRawBody: true, sizeLimit: "1mb" },
    },
    {
      matcher: "/hooks/external/*",
      method: "POST",
      bodyParser: { preserveRawBody: true, sizeLimit: "1mb" },
    },
  ],
})
