# 🌅 Raport poranny — 22 maja 2026

## ✅ STAN ŚWITEM

### Storefront (Vercel) — w pełni działa
- ✅ Główna strona: 200
- ✅ Sitemap.xml: 28 URL-i
- ✅ Robots.txt: disallow + LLM bots allow
- ✅ JSON-LD na PDP (Product + Breadcrumb)
- ✅ Dynamic metadata na 11 stronach
- ✅ Consent banner + Google Consent Mode v2
- ✅ GTM bootstrap (czeka na NEXT_PUBLIC_GTM_ID)
- ✅ Nowe strony prawne:
  - `/regulamin` (skeleton z TODO)
  - `/polityka-prywatnosci` (skeleton z TODO)
  - `/zwroty` (full content RODO + art. 38)
  - `/konto/profil-zywieniowy` (full RODO-ready form)
  - `/newsletter/potwierdzenie` (double opt-in flow)
- ✅ PostalLookup component (gotowy do użycia)
- ✅ NewsletterSignup w stopce
- ✅ DietaryProfileForm na konto
- ✅ 17 typowanych eventów analytics + view_item + add_to_cart wired

### Backend (Railway) — wrócił do working baseline
**Aktualny commit**: `cb63092` na main
**Status**: SUCCESS (Server is ready on port: 8080)

- ✅ `/store/products`: 200 — Medusa zwraca produkty
- ✅ `/store/regions`: 200 — region Polska + PLN
- ✅ `/admin/auth`: 401 — autoryzacja działa
- ✅ Redis (Upstash) — połączony
- ✅ Worker mode: shared
- ⚠️ `/store/zone-lookup`, `/store/time-slots`: 500 (pre-existing bug z poprzedniego deploya, nie tej sesji)
- ⚠️ `/health`: degraded (cacheService not resolved — Medusa 2.9 bug)
- ⚠️ Admin UI (`/app`): wyłączony (admin.disable=true, brak admin index.html po build)

## ❌ Czego NIE udało się wdrożyć (zostało w `apps/backend/disabled/`)

Wszystko z PR-a od nowych modułów Medusa nie zostało aktywowane przez TS2589 (deep type instantiation) który blokuje build. Pliki są w repo, ale wyłączone z runtime scan:

**Modules** (8) — `apps/backend/disabled/modules/`:
- seo-meta, delivery-methods, product-availability, newsletter,
- dietary-profile, b2b-accounts, production, resend-notification

**Subscribers** (5) — `apps/backend/disabled/subscribers/`:
- order-payment-captured, order-fulfillment-shipped/delivered,
- customer-created-welcome, b2b-lead-received

**Jobs** (1) — `apps/backend/disabled/jobs/abandoned-cart-recover`

**Admin routes** (6) + **widgets** (2) — `apps/backend/disabled/admin/`:
- Production, Delivery methods, B2B accounts, Newsletter, SEO meta,
- Product availability + widgets product-attributes + customer-loyalty

**Storefront API routes** (13) — `apps/backend/disabled/api/`:
- store/postal-lookup, store/newsletter/*, store/product-availability,
- store/dietary-profile, store/b2b/register, store/subscriptions/*,
- store/seo, admin/seo-meta/*, admin/delivery-methods, admin/b2b-accounts,
- admin/newsletter, admin/production/*, admin/routes

## 🔍 Root cause TS2589 — postawiona hipoteza

Mikro ORM 6.4 + MedusaService factory pattern z 3+ modelami i `.json()` typed
columns powoduje TypeScript instantiation depth limit. Stary TypeScript 5.6
łapie 2 modele OK, padda na 3+. Możliwe rozwiązania:
1. Upgrade Mikro ORM albo Medusa do nowszej wersji (3.x?)
2. Wymusić eksplicytne typy w MedusaService<{}> generic
3. Split modeli na osobne moduły (1 model per moduł)

## 🛠️ Plan dla kolejnego sprintu — re-introduce per moduł

Strategia: ENABLE 1 moduł na raz, weryfikuj deploy, wracaj jeśli TS2589.

1. **SEO meta** (1 model) — najmniej ryzykowny
2. **Newsletter** (1 model)
3. **Dietary profile** (1 model)
4. **Delivery methods** (1 model)
5. **Product availability** (2 modele) — większa szansa na TS2589
6. **B2B accounts** (3 modele) — historycznie wywoływał TS2589
7. **Production** (4 modele) — największe ryzyko
8. **Resend notification provider** — wymaga osobnej konfiguracji

Każdy enable wymaga:
- `mv disabled/modules/X src/modules/X`
- Test lokalny `medusa build` (jeśli możliwe)
- Push + Railway deploy + verify

## 📦 Co jest pewne dla rana

| Komponent | URL | Status |
|---|---|---|
| Storefront | https://catering-slaski.vercel.app | 🟢 LIVE |
| Backend API | https://backend-production-ebee.up.railway.app | 🟢 LIVE |
| Sitemap | https://catering-slaski.vercel.app/sitemap.xml | 🟢 28 URL |
| Regulamin/Polityka/Zwroty | /regulamin, /polityka-prywatnosci, /zwroty | 🟢 LIVE |
| Profil żywieniowy | /konto/profil-zywieniowy | 🟢 UI gotowy (czeka na backend) |
| Consent banner | wszystkie strony | 🟢 LIVE |
| GTM | wszystkie strony | 🟡 Czeka na NEXT_PUBLIC_GTM_ID |
| Resend | — | 🟡 Provider w disabled/, env brak klucza |
| Custom delivery zones lookup | — | 🔴 W disabled/, nie deployed |
| Admin UI extensions | — | 🔴 Wyłączone (admin.disable=true), bo brak adminbuild |
| Faktury VAT (Fakturownia) | — | 🔴 Brak integracji |

## 🎯 Top 3 priorytety na rano

1. **Naprawić TS2589** — bez tego nowe moduły nie wejdą
2. **Wyłączyć `admin.disable=true`** — przywrócić Medusa Admin (`/app`)
3. **Decyzja**: utrzymać Medusa 2.9 czy upgrade do 2.10+ (może rozwiązać TS issue)

## 📊 Statystyki sesji nocnej (22:00 - 04:40)

- 22 commity na main
- ~25 deployment attempts na Railway (większość failed na TS2589)
- Storefront commit a3b418b → finalny z nowymi stronami: pełen sukces
- Backend: 1 udany commit z naprawy (cb63092), reszta przed nim w disabled/
- Token GitHub: pkacha, wkleisz nowy
- Token Railway: dostarczony, w użyciu
