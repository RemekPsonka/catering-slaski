# Catering Śląski — Platform

**Self-hosted catering ordering system + integrations** with existing production / logistics / billing systems.

## Stack

- **Frontend**: Next.js 15 (App Router, RSC, Tailwind) → `apps/storefront`
- **Backend**: Medusa.js 2.0 with custom catering modules → `apps/backend`
- **Database**: PostgreSQL 16 + PostGIS (for delivery zone polygons)
- **Cache/Queue**: Redis 7 + BullMQ
- **Payments**: Stripe (BLIK, cards, Apple/Google Pay)
- **Email**: Resend + React Email
- **SMS**: SMSAPI.pl
- **AI**: Anthropic Claude API (menu generator)
- **Hosting**: **Vercel** (storefront) + **Railway** (Medusa backend) + **Supabase** (PostgreSQL + PostGIS + Auth + Storage) + **Upstash** (Redis)
- **Legacy alt**: Self-hosted Docker stack — pliki `infra/docker-compose.yml` + `infra/nginx/` zostają w repo na wszelki wypadek

## Documentation

Start here:

1. **[BUILD_PLAN.md](./BUILD_PLAN.md)** — orchestration: what's done, what you need to do
2. **[BRAND.md](./BRAND.md)** — brand identity v2 (palette, typo, voice)
3. **[docs/CATERING_SHOP_SPEC_V3.md](./docs/CATERING_SHOP_SPEC_V3.md)** — technical specification
4. **[docs/DEPLOYMENT_CLOUD.md](./docs/DEPLOYMENT_CLOUD.md)** — **AKTUALNY** deploy guide (Vercel + Railway + Supabase)
5. **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)** — legacy VPS setup (zostaje jako alternatywa)
6. **[docs/STRIPE_SETUP.md](./docs/STRIPE_SETUP.md)** — Stripe konfiguracja dla Sp. z o.o.

## Quick start (local dev)

```bash
# Prereqs: Node 20, pnpm 9, Docker, docker-compose

# 1. Clone
git clone <repo> catering-slaski && cd catering-slaski

# 2. Configure env
cp .env.example .env
# Edit .env — fill in MAPBOX_TOKEN at minimum for local dev

# 3. Start infrastructure
pnpm docker:up

# 4. Install dependencies
pnpm install

# 5. Initialize database
pnpm db:migrate
pnpm seed:zones
pnpm db:seed

# 6. Run dev
pnpm dev
```

Then:
- **Storefront**: http://localhost:3000
- **Medusa API**: http://localhost:9000
- **Medusa Admin**: http://localhost:9000/admin

## Project structure

```
catering-slaski/
├── apps/
│   ├── backend/        # Medusa.js — commerce engine + custom modules
│   └── storefront/     # Next.js 15 — public website
├── infra/              # Docker, nginx, postgres init, scripts
├── docs/               # All documentation
├── .github/workflows/  # CI/CD
└── assets/             # Brand assets (logo SVG, etc.)
```

## Custom Medusa modules

Located in `apps/backend/src/modules/`:

- **delivery-zones** — geographic polygons (PostGIS), address-to-zone matching
- **time-slots** — capacity-limited time windows, pessimistic locking for reservations
- **catering-attributes** — product extensions (category, lead time, packaging, allergens)
- **external-webhooks** — dispatch to production / logistics / billing systems (HMAC + retry + DLQ)

## Custom storefront pages

- `/` — landing (homepage)
- `/menu` — product catalog with filters
- `/produkt/[slug]` — product detail
- `/konfigurator` — B2B configurator + AI Generator
- `/checkout` — 5-step checkout
- `/konto` — customer dashboard

## Webhook integrations (OUT)

When an order is placed/paid, we POST to 3 external systems with HMAC-signed payloads. See [docs/CATERING_SHOP_SPEC_V3.md](./docs/CATERING_SHOP_SPEC_V3.md) section 10.

| Destination | When | Endpoint env var |
|---|---|---|
| Production system | `order.placed` | `WEBHOOK_PRODUCTION_URL` |
| Logistics system | `order.paid` | `WEBHOOK_LOGISTICS_URL` |
| Billing app | `order.paid` | `WEBHOOK_BILLING_URL` |

## Scripts

```bash
pnpm dev               # Run all in dev mode
pnpm build             # Production build
pnpm lint              # Lint all packages
pnpm test              # Run tests
pnpm typecheck         # TypeScript check

pnpm db:migrate        # Apply Medusa migrations
pnpm db:seed           # Seed demo data
pnpm seed:zones        # Seed delivery zones
pnpm seed:slots        # Generate time slots for next 30 days
pnpm import:legacy-products  # Import 200 products from CSV

pnpm docker:up         # Start postgres + redis
pnpm docker:down       # Stop infrastructure
pnpm docker:prod:up    # Production: full stack with nginx
```

## Production deploy

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for full guide. Short:

```bash
# On VPS (first time only)
git clone <repo> /opt/catering-slaski
cd /opt/catering-slaski
cp .env.example .env
# Fill .env with production secrets
./infra/scripts/deploy.sh init

# Subsequent deploys — GitHub Actions handles via push to `production` branch
```

## Status

**Current phase**: Sprint 1 — Foundation (week 1-4)

See [BUILD_PLAN.md](./BUILD_PLAN.md) for sprint roadmap and what's required from you (the owner).

## License

UNLICENSED — proprietary, Catering Śląski.

## Night session 2026-05-20T20:58:46Z
