import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"

/**
 * GET / — root route — friendly landing instead of "Cannot GET /".
 *
 * Medusa to API server, więc / nie ma natywnego endpointa. Bez tej trasy klienci
 * dostają Express'owy 404 z plain-textem "Cannot GET /" co wygląda jak awaria.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const accept = (req.headers.accept as string) || ""
  const wantsHtml = accept.includes("text/html") && !accept.includes("application/json")

  const payload = {
    service: "Catering Śląski — Medusa Backend API",
    version: "1.0.0",
    status: "ok",
    environment: process.env.NODE_ENV || "production",
    documentation: "https://docs.medusajs.com/api/store",
    storefront: process.env.NEXT_PUBLIC_BASE_URL || "https://catering-slaski.vercel.app",
    endpoints: {
      health: "/health",
      store: {
        products: "/store/products",
        regions: "/store/regions",
        carts: "/store/carts",
        orders: "/store/orders",
      },
      admin: {
        login: "/auth/admin/emailpass",
        dashboard: "/app",
      },
      catering: {
        postal_lookup: "/store/postal-lookup",
        newsletter_signup: "/store/newsletter/signup",
        dietary_profile: "/store/dietary-profile",
        b2b_register: "/store/b2b/register",
        time_slots: "/store/time-slots",
        product_availability: "/store/product-availability",
      },
    },
    timestamp: new Date().toISOString(),
  }

  if (!wantsHtml) {
    return res.status(200).json(payload)
  }

  const html = `<!doctype html>
<html lang="pl">
<head>
  <meta charset="utf-8" />
  <title>Catering Śląski — Backend API</title>
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="robots" content="noindex,nofollow" />
  <style>
    *,*::before,*::after{box-sizing:border-box}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;margin:0;padding:2rem;background:#fafaf9;color:#1c1917;line-height:1.5}
    .wrap{max-width:760px;margin:0 auto}
    h1{margin:0 0 .25rem;font-size:1.5rem}
    p.muted{color:#78716c;margin:.25rem 0 1.5rem}
    .badge{display:inline-block;background:#16a34a;color:#fff;padding:.125rem .5rem;border-radius:.25rem;font-size:.75rem;font-weight:600}
    .grid{display:grid;grid-template-columns:1fr;gap:.75rem;margin-top:1rem}
    .card{background:#fff;border:1px solid #e7e5e4;border-radius:.5rem;padding:1rem}
    .card h2{margin:0 0 .5rem;font-size:1rem;color:#44403c}
    .card ul{list-style:none;padding:0;margin:0}
    .card li{padding:.25rem 0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.875rem}
    .card a{color:#0369a1;text-decoration:none}
    .card a:hover{text-decoration:underline}
    .meta{margin-top:1.5rem;font-size:.75rem;color:#a8a29e}
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Catering Śląski — Backend API <span class="badge">OK</span></h1>
    <p class="muted">Medusa.js API server. Storefront mieszka pod <a href="${payload.storefront}">${payload.storefront.replace(/^https?:\/\//, "")}</a>.</p>
    <div class="grid">
      <div class="card"><h2>Health &amp; status</h2><ul><li>GET <a href="/health">/health</a></li></ul></div>
      <div class="card"><h2>Store API (publishable key required)</h2><ul><li>GET /store/products</li><li>GET /store/regions</li><li>POST /store/carts</li><li>POST /store/orders</li></ul></div>
      <div class="card"><h2>Catering routes</h2><ul><li>POST /store/postal-lookup</li><li>POST /store/newsletter/signup</li><li>GET/POST /store/dietary-profile</li><li>POST /store/b2b/register</li><li>GET /store/time-slots</li><li>GET /store/product-availability</li></ul></div>
      <div class="card"><h2>Admin</h2><ul><li>POST /auth/admin/emailpass</li><li>GET <a href="/app">/app</a> (dashboard)</li></ul></div>
    </div>
    <p class="meta">${payload.timestamp} · env: ${payload.environment} · v${payload.version}</p>
  </div>
</body>
</html>`

  res.setHeader("Content-Type", "text/html; charset=utf-8")
  return res.status(200).send(html)
}
