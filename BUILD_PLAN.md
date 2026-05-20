# BUILD_PLAN.md — orkiestracja budowy

**Cel:** zbudować Catering Śląski (sklep + integracje) na własnej infrastrukturze.
**Tryb:** Claude działa autonomicznie, użytkownik robi minimum.
**Data startu:** 20 maja 2026.

---

## 1. Podział odpowiedzialności — co Claude, co Ty

### ✅ Co robię JA autonomicznie

| Obszar | Konkretnie |
|---|---|
| **Kod aplikacji** | Backend Medusa + Next.js storefront + custom moduły + workflows + subscribers |
| **Infrastruktura jako kod** | Docker, docker-compose, Dockerfile per usługa, nginx config, postgres init |
| **Baza danych** | Schema PostGIS, migracje, seeds, indeksy |
| **CI/CD** | GitHub Actions workflows (lint + test + build + deploy) |
| **Dokumentacja** | DEPLOYMENT.md, ENVIRONMENT.md, API_CONTRACTS.md, runbooki |
| **Konfiguracja** | Wszystkie pliki .env.template, nginx.conf, medusa-config.ts, next.config |
| **Skrypty deployu** | deploy.sh, backup-db.sh, restore-db.sh, healthcheck.sh |
| **Migracje danych** | Skrypt importu 200 produktów z CSV, generator slotów, seedy stref |
| **Testy** | Unit + integration testy dla custom modułów i webhook dispatch |

### 🙋 Co MUSISZ zrobić Ty (i tylko Ty)

Te 7 rzeczy fizycznie wymagają Twojej obecności / Twoich danych. Razem **~2-3h pracy** rozłożone na 2 tygodnie.

#### Krok 1 — Konta zewnętrzne (~45 min)

| Konto | Po co | Kiedy potrzebne |
|---|---|---|
| **Stripe.com** (rachunek PL) | Płatności, BLIK, Apple/Google Pay | Sprint 1 |
| **Fakturownia.pl** | Auto-faktury VAT | Sprint 2 |
| **Resend.com** | Email transakcyjny | Sprint 1 |
| **SMSAPI.pl** | SMS notifications | Sprint 2 |
| **Mapbox.com** | Geocoding + polygons + route opt | Sprint 1 |
| **Anthropic Console** | Claude API key dla AI Generator | Sprint 3 |
| **GitHub** (jeśli nie masz) | Repozytorium + CI/CD | Sprint 1 |

Po założeniu każdego — daj mi sekret/klucz (przez sejf hasło / Bitwarden link / 1Password share). Wkleję je w odpowiednie pliki `.env` po Twojej stronie.

#### Krok 2 — VPS / serwer (~30 min, jednorazowo)

Polecam: **Hetzner Cloud CCX22** (~30€/mies) lub **OVH VPS Comfort** (~25€/mies). Dla startu wystarczy 4 vCPU + 16 GB RAM + 160 GB SSD.

Co konkretnie zrób:
1. Załóż konto Hetzner/OVH
2. Zamów serwer Ubuntu 22.04 LTS w lokalizacji **Falkenstein** (Niemcy, najbliżej PL)
3. Dodaj swój klucz SSH (jeśli nie masz: `ssh-keygen -t ed25519`)
4. Notuj IP serwera

Potem przekaż mi:
- IP serwera
- Klucz SSH publiczny (mojego klienta — wystarczy że mnie tu skonfigurujesz później)

**Alternatywnie**: jeśli masz już własny stos (Proxmox, K8s, bare metal) — daj znać jaki, dostosuję docker-compose.

#### Krok 3 — Domena i DNS (~20 min)

- Domena `cateringslaski.pl` już jest Twoja (od OVH lub Home.pl)
- Skonfiguruj rekordy DNS (instrukcję krok-po-kroku dam w DEPLOYMENT.md):
  - `A` → IP VPS
  - `A` (admin) → IP VPS
  - `A` (api) → IP VPS
  - `MX` (zostaw obecne)

#### Krok 4 — Migracja danych ze starego sklepu (~1h)

- Zaloguj się do panelu ec-instant-site
- Wyeksportuj wszystkie produkty do CSV (zwykle Account → Export → Products)
- Wyeksportuj klientów (jeśli możesz) — alternatywnie zostawiamy stare zamówienia w starym systemie, nowe konta klient zakłada od zera
- Wrzuć CSV do repozytorium (`apps/backend/data/legacy-products.csv`)
- Mój skrypt zaimportuje to do Medusa

#### Krok 5 — Sesja zdjęciowa (~planowanie 30 min, sesja osobno)

To **blocker dla launch**. Bez prawdziwych zdjęć produktów konwersja będzie 30% niższa. Plan:
- Znajdź fotografa w okolicy Katowic/DG (brief w `BRAND.md` sekcja 7)
- Zarezerwuj sesję 1-2 dni w kuchni (50 BOXów + 20 sytuacyjnych)
- Po sesji wrzucisz zdjęcia do `apps/storefront/public/products/` lub Cloudinary

#### Krok 6 — Uzgodnienie webhook contracts z zespołem ops (~45 min)

Sprint 2 nie ruszy bez tego. Trzy systemy istnieją u Was:
1. System produkcji
2. System logistyki
3. Aplikacja rozliczeń

Z każdym zespołem ops uzgodnij:
- Endpoint URL (gdzie wysyłamy webhook)
- Shared secret HMAC
- Czy wspierają webhook IN (status update z powrotem do sklepu)

Format payload jest w `docs/CATERING_SHOP_SPEC_V3.md` sekcja 10. Wyślij im ten dokument do reviewu.

#### Krok 7 — Akceptacja i decyzje strategiczne (~30 min)

Przy każdym milestone dostaniesz ode mnie pytania typu "yes/no":
- "Czy 'Strefa Lokalna' obejmuje też Mysłowice?"
- "Lunch box subskrypcyjny — minimum 4 dostawy czy bez limitu?"
- "Co z B2C klientami starego sklepu — emailem ich migrujemy?"

Odpowiadaj jednym zdaniem, idziemy dalej.

---

## 2. Co już mamy w repo (przed dzisiejszą nocą)

```
catering-slaski-redesign/
├── STRATEGIA.md                  ← v1 biznes (analiza konkurencji, KPI)
├── BRAND.md                      ← v2 brand book (paleta, typo, voice, logo rules)
├── assets/logo.svg               ← reusable SVG logo
├── index.html                    ← przewodnik
├── 01-landing.html → 05-konto.html  ← mockupy (01 w nowym brandzie)
└── docs/
    ├── CATERING_SHOP_FULL_SPEC.md (archiwalne, "build everything")
    └── CATERING_SHOP_SPEC_V3.md   ← AKTUALNE (sklep + webhooki)
```

## 3. Co dodaję teraz (build foundation)

```
catering-slaski-redesign/
├── BUILD_PLAN.md                 ← ten dokument
├── README.md                     ← punkt startowy dla dev
├── package.json                  ← monorepo root
├── turbo.json
├── pnpm-workspace.yaml
├── .gitignore
├── .editorconfig
├── .nvmrc
├── .env.example                  ← all-in-one przykład
│
├── apps/
│   ├── backend/                  ← Medusa.js 2.0
│   │   ├── package.json
│   │   ├── medusa-config.ts
│   │   ├── tsconfig.json
│   │   ├── .env.template
│   │   ├── Dockerfile
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── delivery-zones/         ← custom: polygony, address-to-zone
│   │   │   │   ├── time-slots/             ← custom: capacity + locking
│   │   │   │   ├── catering-attributes/    ← custom: rozszerzenie Product
│   │   │   │   └── external-webhooks/      ← custom: dispatch do 3 systemów
│   │   │   ├── api/
│   │   │   │   ├── store/
│   │   │   │   │   ├── zone-lookup/route.ts
│   │   │   │   │   ├── time-slots/route.ts
│   │   │   │   │   └── ai/generate-menu/route.ts
│   │   │   │   └── admin/...
│   │   │   ├── subscribers/
│   │   │   │   ├── order-placed-production.ts
│   │   │   │   ├── order-paid-logistics.ts
│   │   │   │   └── order-paid-billing.ts
│   │   │   └── workflows/
│   │   │       ├── reserve-time-slot.ts
│   │   │       └── ai-generate-menu.ts
│   │   └── scripts/
│   │       ├── seed-zones.ts
│   │       └── import-legacy-products.ts
│   │
│   └── storefront/               ← Next.js 15
│       ├── package.json
│       ├── next.config.ts
│       ├── tsconfig.json
│       ├── tailwind.config.ts
│       ├── postcss.config.js
│       ├── .env.template
│       ├── Dockerfile
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── globals.css
│       │   ├── page.tsx                    ← landing (z 01-landing.html)
│       │   ├── menu/page.tsx
│       │   ├── produkt/[slug]/page.tsx
│       │   ├── koszyk/page.tsx
│       │   ├── checkout/page.tsx
│       │   ├── konto/page.tsx
│       │   └── api/                        ← Next API routes
│       ├── components/
│       │   ├── ui/
│       │   ├── layout/Header.tsx
│       │   ├── product/ProductCard.tsx
│       │   ├── zones/AddressPicker.tsx
│       │   └── ai/AIGenerator.tsx
│       └── lib/
│           ├── medusa.ts                   ← Medusa client
│           ├── mapbox.ts                   ← Geocoding client
│           └── utils.ts
│
├── infra/
│   ├── docker-compose.yml                  ← dev stack
│   ├── docker-compose.prod.yml             ← production overlay
│   ├── docker-compose.dev.yml
│   ├── nginx/
│   │   ├── nginx.conf
│   │   └── sites/
│   │       ├── cateringslaski.conf         ← storefront + admin
│   │       └── api.cateringslaski.conf     ← Medusa API
│   ├── postgres/
│   │   └── init.sql                        ← PostGIS + base schema
│   └── scripts/
│       ├── deploy.sh
│       ├── backup-db.sh
│       ├── restore-db.sh
│       └── healthcheck.sh
│
└── .github/
    └── workflows/
        ├── ci.yml                          ← lint + test + build
        └── deploy.yml                      ← deploy do VPS
```

## 4. Sprinty (10 tygodni do produkcji)

### Sprint 1 — Fundament (tyg 1-4)

**Mój output:**
- Cały scaffolding (już teraz)
- Custom moduł `delivery-zones` (model + service + API)
- Custom moduł `time-slots` (model + reservation workflow + cron cleanup)
- Storefront landing + katalog + karta produktu (z brand v2)
- Skrypt importu 200 produktów z CSV
- Storefront `/menu` z filtrami

**Twój output:**
- Konta: Stripe, Mapbox, GitHub, Hetzner VPS
- Domena + DNS
- CSV ze starego sklepu

**Milestone:** sklep działa lokalnie + na staging VPS. Można dodać do koszyka, ale checkout jeszcze nie.

### Sprint 2 — Checkout + webhooki + konto (tyg 5-7)

**Mój output:**
- Custom moduł `external-webhooks` (dispatch + retry + DLQ)
- 3 subscribery: order.placed → produkcja, order.paid → logistyka + rozliczenia
- Stripe plugin + BLIK setup
- Checkout 5-stepowy (z mockupu)
- Konto klienta (dashboard, historia, ulubione)
- Email templates (Resend + React Email)
- Mock servers dla 3 docelowych systemów (do testów)

**Twój output:**
- Stripe live keys (po weryfikacji konta)
- Resend API key
- Fakturownia account + API key
- Uzgodnienie kontraktów webhook z ops team (krok 6 powyżej)

**Milestone:** klient może zamówić BOX z BLIK, dostaje email, webhooki out wychodzą do mock systemów.

### Sprint 3 — AI + subskrypcje + promocje + launch (tyg 8-10)

**Mój output:**
- Anthropic Claude API integration
- AI Generator menu (`/api/ai/generate-menu`)
- Konfigurator B2B (z mockupu)
- Custom moduł `subscriptions` + Stripe Subscriptions
- Loyalty engine (Bronze → Platinum rolling 12m)
- Referral codes
- Sanity setup dla content/blog
- Migracja produkcyjna (DNS switch, redirects)

**Twój output:**
- Anthropic API key
- Sanity Studio account (lub używamy lokalnie)
- SMSAPI key
- Akceptacja go-live

**Milestone:** pełna platforma na cateringslaski.pl, stary sklep wyłączony.

## 5. Co mogę zrobić W TYM TURZE

Jest tego dużo, więc realnie w **tym turze** (jednym wywołaniu):

✅ **DOSTARCZONE TERAZ:**
1. BUILD_PLAN.md (ten dokument) — orkiestracja
2. Monorepo root (package.json, turbo, pnpm-workspace, gitignore)
3. README.md (jak uruchomić)
4. Infrastructure docker-compose + Dockerfile per app + nginx + postgres init
5. Backend skeleton: package.json, medusa-config, .env.template, delivery-zones module (kompletny: model + service + migrations + API), time-slots module (model + reservation workflow), webhook dispatcher
6. Storefront skeleton: package.json, next.config, tailwind, layout, homepage (port z 01-landing.html do React)
7. CI/CD GitHub Actions (ci.yml + deploy.yml)
8. DEPLOYMENT.md + ENVIRONMENT.md

🔜 **NASTĘPNE TURY (sprint 1):**
- Pełne moduły catering-attributes, external-webhooks z testami
- Wszystkie storefront strony (menu, produkt, checkout, konto)
- Skrypt import-legacy-products
- Seeds dla stref dostawy (polygony Śląska w GeoJSON)
- Mock servers dla 3 systemów docelowych

## 6. Jak uruchomisz lokalnie

Po tym turze, kiedy klonujesz repo:

```bash
# Wymagane: Node 20, pnpm 9, Docker, docker-compose
git clone <repo> catering-slaski
cd catering-slaski

# 1. Skopiuj .env.example → .env i wypełnij
cp .env.example .env
# (edytuj — wypełnij Mapbox token i resztą)

# 2. Postaw stack lokalnie
docker compose up -d postgres redis
pnpm install
pnpm db:migrate
pnpm db:seed

# 3. Uruchom dev
pnpm dev
# → http://localhost:3000 (storefront)
# → http://localhost:9000 (Medusa API)
# → http://localhost:7001 (Medusa Admin)
```

## 7. Jak zdeployujesz na VPS

Pełna instrukcja w `docs/DEPLOYMENT.md`. W skrócie:

```bash
# Z lokalnej maszyny (jednorazowo)
./infra/scripts/deploy.sh init --host=YOUR_VPS_IP

# Każdy kolejny deploy — robi to GitHub Actions automatycznie
# Trigger: push na branch `production` → deploy.yml → SSH na VPS → docker compose pull && up
```

## 8. Czego NIE robię (świadomie)

Nie robię tego, bo to systemy które już istnieją u Was (per spec V3):
- ❌ KDS (kitchen display system) — Wasz system produkcji
- ❌ Route planning — Wasz system logistyki
- ❌ Fakturowanie VAT — Wasza aplikacja rozliczeń (tylko WEBHOOK do niej)
- ❌ Aplikacja kierowcy — Wasz system logistyki
- ❌ Inventory składników — Wasz system produkcji
- ❌ Recepty / planowanie produkcji — Wasz system produkcji

Sklep robi swoje (przyjmuje zamówienia + płatność) i wysyła webhook out do reszty.

## 9. Decyzje techniczne ostateczne (do tej pory)

| Decyzja | Wybór | Powód |
|---|---|---|
| Stack frontend | Next.js 15 (App Router, RSC) | Top SEO + AI SDK + Vercel optional |
| Stack backend | Medusa.js 2.0 | Commerce out-of-the-box, modular, TS |
| Baza | PostgreSQL 16 + PostGIS | Spatial queries dla polygonów stref |
| Cache/Queue | Redis 7 | BullMQ workers + cache |
| Hosting | **Self-hosted VPS** | "Własny stack" per user request |
| Konteneryzacja | Docker + docker-compose | Portable, łatwy deploy |
| Reverse proxy | Nginx | Standard, lekki, certbot dla SSL |
| SSL | Let's Encrypt (certbot) | Free, auto-renewal |
| CI/CD | GitHub Actions | Free dla public + 2000 min/mies dla private |
| Płatności | Stripe (BLIK + karta + Apple/Google Pay) | Polskie BLIK przez Stripe od 2024 |
| Email | Resend | Best DX, React Email templates |
| SMS | SMSAPI.pl | Polski, tańszy niż Twilio |
| Maps | Mapbox | Polygony + Geocoding + VRP |
| AI | Anthropic Claude API | Lepsze rozumienie polskiego briefu |
| CMS | Sanity (tylko content) | Już połączony, schema-first |
| Monitoring | Sentry (errors) + Uptime Kuma self-hosted | Standard |

## 10. Następne kroki TERAZ — TwojeM

Po tym turze:
1. **Przejrzyj BUILD_PLAN.md** (ten plik) — czy zgadzasz się z podziałem odpowiedzialności
2. **Załóż konto Hetzner** (lub powiedz mi jaki masz alternatywny stos)
3. **Zacznij robić Krok 1** — konta zewnętrzne (~45 min total, możesz rozłożyć w czasie)
4. Daj mi sygnał kiedy gotowe — kontynuuję

Pliki kodu i konfiguracji są gotowe — zaraz przegląd niżej.

---

*BUILD_PLAN.md v1 · 20 maja 2026 · Catering Śląski production build*
