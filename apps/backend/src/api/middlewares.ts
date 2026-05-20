import { defineMiddlewares } from "@medusajs/framework/http"
import { raw, json } from "body-parser"

/**
 * Medusa middleware overrides.
 *
 * KRYTYCZNE: webhooki (Stripe + nasze external) MUSZĄ dostać raw body
 * przed parsingiem JSON — inaczej HMAC signature się nie zgodzi.
 *
 * Pattern:
 *   /hooks/* → raw body (req.rawBody jako Buffer + sparsowany JSON jako req.body)
 *   wszystko inne → standardowy Medusa JSON parser
 */

// Middleware: raw → parsed JSON, oba dostępne
function rawAndParse(req: any, _res: any, next: any) {
  if (Buffer.isBuffer(req.body)) {
    req.rawBody = req.body
    // Re-parse body as JSON for route handlers (signature was already verified on raw)
    try {
      const text = req.body.toString("utf8")
      req.body = text.length > 0 ? JSON.parse(text) : {}
    } catch {
      // leave req.body as Buffer; handler will handle parse error
    }
  }
  next()
}

export default defineMiddlewares({
  routes: [
    {
      matcher: "/hooks/payment/stripe",
      method: "POST",
      bodyParser: false,
      middlewares: [
        raw({ type: "application/json", limit: "1mb" }) as any,
        rawAndParse,
      ],
    },
    {
      matcher: "/hooks/external/*",
      method: "POST",
      bodyParser: false,
      middlewares: [
        raw({ type: "application/json", limit: "1mb" }) as any,
        rawAndParse,
      ],
    },
  ],
})
