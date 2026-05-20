# DEPLOYMENT_CLOUD.md — Setup Cloud Stack

**Cel:** wdrożyć Catering Śląski na **Vercel + Railway + Supabase + Upstash**.
**Czas Twojej pracy:** ~15 minut (głównie kopiowanie tokenów).
**Czas mojej pracy:** ~30 minut po dostaniu tokenów (autonomicznie).

> Ten dokument **zastępuje** `DEPLOYMENT.md` (który był dla VPS). Pliki VPS-specific (`docker-compose.yml`, `nginx/`, `deploy.sh`) zostają w repo jako legacy — przyda się jeśli kiedyś zmienisz strategię.

---

## Architektura docelowa

```
┌────────────────────────────────────────────────────────────┐
│  VERCEL (cateringslaski.pl)                                │
│  → Next.js 15 storefront                                   │
│  → Server Components, API routes, AI SDK                   │
│  → Edge network (CDN globalny)                             │
└────────────────┬───────────────────────────────────────────┘
                 │
                 ↓ HTTPS API calls
┌────────────────────────────────────────────────────────────┐
│  RAILWAY (api.cateringslaski.pl)                           │
│  → Medusa.js 2.0 backend (always-on Node.js)               │
│  → BullMQ workers (webhook dispatch + cron)                │
└──┬──────────────────────────────────────────────────┬──────┘
   │                                                  │
   ↓                                                  ↓
┌─────────────────────────────┐    ┌──────────────────────────┐
│  SUPABASE                   │    │  UPSTASH REDIS           │
│  → PostgreSQL 16 + PostGIS  │    │  → Cache                 │
│  → Auth (customer accounts) │    │  → BullMQ queue          │
│  → Storage (zdjęcia)        │    └──────────────────────────┘
└─────────────────────────────┘
```

---

## CZĘŚĆ A — Co Ty robisz (15 min)

### A.1 — Utwórz konta (jeśli jeszcze nie masz)

| Konto | Link | Status |
|---|---|---|
| Vercel | https://vercel.com/signup | ✅ masz |
| Supabase | https://supabase.com | ✅ masz |
| Railway | https://railway.com/login | 🆕 utwórz przez GitHub |
| Upstash | https://console.upstash.com/login | 🆕 utwórz przez GitHub |
| GitHub | https://github.com | ✅ zakładam że masz |

### A.2 — Utwórz projekty docelowe (kliknij raz na każdym)

**Vercel:**
1. https://vercel.com/new
2. Import repo `nono-food/catering-slaski` (po zrobieniu A.3)
3. Framework: Next.js (auto-detect)
4. **Root directory:** `apps/storefront`
5. **NIE klikaj Deploy jeszcze** — najpierw musimy mieć env vars
6. Klik "Configure Project" → "Create"

**Supabase:**
1. https://supabase.com/dashboard/projects → "New project"
2. **Name:** `catering-slaski`
3. **Database password:** wygeneruj silne, **zapisz w Bitwarden** (potrzebne dla `DATABASE_URL`)
4. **Region:** Frankfurt (najbliżej PL)
5. **Pricing plan:** Free (zacznie się, można upgrade później)
6. Klik "Create new project"
7. Poczekaj 1-2 min na provisioning
8. Po stworzeniu: Settings → Database → włącz **Extensions → PostGIS**

**Railway:**
1. https://railway.com/new → "Empty Project"
2. **Project name:** `catering-slaski`
3. (Później ja dodam services przez CLI z tokenem)

**Upstash:**
1. https://console.upstash.com/redis → "Create Database"
2. **Name:** `catering-slaski-redis`
3. **Region:** EU West (Frankfurt)
4. **Type:** Pay as you go (free tier do 10k req/dzień)
5. Klik "Create"

### A.3 — Utwórz GitHub repo (jeśli nie ma)

```bash
# Na Twojej maszynie lokalnej (lub przez github.com UI):
gh repo create nono-food/catering-slaski --private --description "Catering Śląski platform"
```

Albo przez UI: github.com/new → name: `catering-slaski` → Private → Create.

### A.4 — Wygeneruj 4 tokeny (5 minut)

Zgodnie z instrukcją w `STRIPE_SETUP.md` przygotuj:

| # | Token | Skąd | Format |
|---|---|---|---|
| 1 | **Vercel slug** | Z URL dashboardu | jednowyrazowe (np. `nono-food`) |
| 2 | **Railway token** | https://railway.com/account/tokens | UUID |
| 3 | **Supabase token** | https://supabase.com/dashboard/account/tokens | `sbp_...` |
| 4 | **GitHub PAT** | https://github.com/settings/personal-access-tokens/new | `github_pat_...` |

Plus dane z paneli (po stworzeniu projektów):

| Dane | Skąd |
|---|---|
| Supabase `DATABASE_URL` | Project Settings → Database → Connection string (URI mode, "Transaction") |
| Supabase `DATABASE_DIRECT_URL` | Project Settings → Database → Connection string (URI mode, "Session") |
| Supabase `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API → URL |
| Supabase `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API → Project API keys → `anon public` |
| Supabase `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → Project API keys → `service_role` (SECRET!) |
| Supabase `SUPABASE_PROJECT_REF` | Project Settings → General → Reference ID |
| Upstash `REDIS_URL` | Database → Details → Endpoint → "Redis URL" (rediss://...) |
| Upstash REST URL + Token | Database → Details → REST API |

**Wklej mi wszystko do czatu** — dam Ci szablon w sąsiednim turnie.

---

## CZĘŚĆ B — Co JA robię (30 min, autonomicznie)

Gdy dostanę tokeny i dane:

### B.1 — Push kodu do GitHub (5 min)

```bash
# Z mojego sandboxu:
cd /sessions/.../catering-slaski-redesign
git init && git add . && git commit -m "Initial commit: cloud-ready stack"
gh repo create nono-food/catering-slaski --private --source=. --push
```

### B.2 — Supabase: migracja + extensions (5 min)

```bash
supabase link --project-ref [PROJECT_REF]
supabase db push  # uruchamia 20260520000000_init_schema.sql + 20260520000001_stripe_events.sql
supabase gen types typescript --linked > apps/storefront/lib/database.types.ts
```

Co się dzieje:
- ✅ PostgreSQL + PostGIS extension włączone
- ✅ 14 custom tables stworzonych (delivery_zones, time_slots, webhook_deliveries, etc.)
- ✅ Typed TypeScript dla całej DB dostępne dla storefrontu

### B.3 — Railway: deploy Medusa backend (10 min)

```bash
railway login --token $RAILWAY_TOKEN
railway link --project catering-slaski
railway service create backend
railway variables set DATABASE_URL=... REDIS_URL=... STRIPE_API_KEY=... [reszta env]
railway up apps/backend  # build + deploy
```

Co się dzieje:
- ✅ Medusa backend kompiluje się przez Nixpacks
- ✅ Migracje Medusa uruchamiają się przy starcie
- ✅ Subscribery + workers startują (BullMQ podłącza do Upstash Redis)
- ✅ Health endpoint odpowiada na `/health`
- ✅ Custom domain: `api.cateringslaski.pl` (gdy DNS będzie skonfigurowany)

### B.4 — Vercel: deploy storefront (5 min)

```bash
# Via Vercel MCP (mam to natywne):
deploy_to_vercel  # z konfiguracją w apps/storefront/vercel.json
```

Co się dzieje:
- ✅ Next.js 15 buildu się i deployuje na Vercel Edge
- ✅ Env vars (Supabase keys, Medusa URL, Mapbox, Stripe) podpięte
- ✅ Domain: `cateringslaski.pl` (gdy DNS)
- ✅ Preview deploys dla każdego PR

### B.5 — Test E2E (5 min)

```bash
# Mock test scenario:
curl https://api.cateringslaski.pl/health  # → 200 OK
curl https://api.cateringslaski.pl/store/zone-lookup?lat=50.26&lng=19.02  # → zone matched
curl https://cateringslaski.pl  # → storefront live
```

Jeśli wszystko OK → robię screencast i wysyłam Ci link żebyś zobaczył jak to wygląda.

---

## CZĘŚĆ C — Po deployu (Twoje akcje, 10 min)

### C.1 — DNS

W panelu Twojego rejestratora domeny (OVH/Home.pl/etc.):

| Subdomena | Type | Wartość |
|---|---|---|
| `cateringslaski.pl` (root) | CNAME | `cname.vercel-dns.com` |
| `www.cateringslaski.pl` | CNAME | `cname.vercel-dns.com` |
| `api.cateringslaski.pl` | CNAME | `[twoja-railway-service].up.railway.app` |

Propagacja DNS 5-30 minut. Vercel + Railway auto-issue SSL przez Let's Encrypt.

### C.2 — Stripe webhook

Po deployu wracam do Ciebie z dokładnym URLem:
- `https://api.cateringslaski.pl/hooks/payment/stripe`
- Dodajesz w Stripe Dashboard → Webhooks → Add endpoint
- Kopiujesz `whsec_...` → wysyłasz mi → wkleję w Railway env

### C.3 — Test BLIK end-to-end

W Stripe test mode użyj BLIK kod **`123456`** (Stripe test fixture). Pełen flow:
1. Otwórz `cateringslaski.pl/menu`
2. Dodaj BOX do koszyka
3. Wpisz adres → strefa się dopasuje
4. Wybierz slot
5. Wpisz dane + zaznacz BLIK
6. Wpisz kod `123456`
7. Powinno: order created → webhook out do mock systemów → email z potwierdzeniem

---

## Koszty miesięczne

| Usługa | Plan | Koszt |
|---|---|---|
| **Vercel** | Hobby (wystarczy) lub Pro | $0 / $20 |
| **Supabase** | Free (do 500MB) lub Pro | $0 / $25 |
| **Railway** | Hobby + Postgres-free | $5-15 |
| **Upstash Redis** | Pay-per-use (free 10k/dzień) | $0-5 |
| **Stripe** | Pay per transaction | 1.4% + 0.25 zł |
| **TOTAL** | **Małe wolumeny** | **$5-65/mies** |

Po 500+ zamówień miesięcznie warto upgrade Supabase → Pro.

---

## Daily ops po deployu

| Zadanie | Kto robi | Jak |
|---|---|---|
| Deploy nowej feature | **Claude** | `git push` → auto-deploy Vercel + Railway |
| Czytanie logów błędu | **Claude** | Vercel MCP `get_runtime_logs` |
| Migration DB | **Claude** | `supabase db push` |
| Restart serwisu | **Claude** | `railway restart` |
| Edycja produktów | **Ty** | Medusa Admin: `api.cateringslaski.pl/admin` |
| Marketing copy | **Ty** | Sanity Studio (po setupie) |
| Zarządzanie strefami | **Ty** | Medusa Admin → Delivery Zones |

**Twoje zaangażowanie po deployu: ~30 min/tydzień** (sprawdzanie zamówień, edycja menu).

---

## Co dalej

Po sukcesie deployu (Część B done):

- 📦 Restyle mockupów 02-05 pod brand v2 (kontynuacja)
- 🛒 Sprint 2 — checkout + Stripe webhooki + Fakturownia
- 🤖 Sprint 3 — AI Generator menu + subskrypcje + loyalty

Dokument `BUILD_PLAN.md` pokazuje pełen roadmap.

---

*DEPLOYMENT_CLOUD.md v1 — 20 maja 2026*
