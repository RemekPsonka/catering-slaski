# 🌙 RAPORT NOCNY — sesja 2026-05-21

## TL;DR (1 ekran)

Sesja dorzuciła **7 nowych modułów Medusa + 11 admin routes + 19 storefront/backend API endpoints + 4 storefront strony + pełną dokumentację**. Catering Śląski przeszedł z "działającego MVP analytics+SEO+maile" do **"sklepu z infrastrukturą enterprise dla cateringu"** — choć część infrastruktury wymaga uruchomienia migracji DB + seedów + uzupełnienia danych.

**Stan postępu wg priorytetów:**
- **P1 (must have):** 9/12 ukończone (75%)
- **P2 (should have):** 4/7 ukończone (57%)
- **P3 (nice to have):** 1/8 ukończone (12%)

**Krytyczne czerwone punkty rano:**
1. ❗ Po Railway deploy → uruchom `pnpm db:migrate` — bez tego 7 nowych modułów nie działa
2. ❗ Uruchom `seed-delivery-methods.ts` — bez tego storefront nie pokazuje metod
3. ❗ Ustaw `RESEND_API_KEY` + `NEXT_PUBLIC_GTM_ID` (klucze których nie mam)
4. ❗ Stare custom endpointy `/store/zone-lookup`, `/store/time-slots` zwracają 500 — wymagają osobnego debugu (pre-existing, nie z tej sesji)

---

## Co zostało zbudowane

### 7 nowych modułów Medusa
1. `seo-meta` — admin-editable meta tags per URL
2. `resend-notification` — provider do Notification module
3. `delivery-methods` — globalny katalog sposobów dostawy (6 metod seedowanych)
4. `product-availability` — kalendarz dostępności dań + daily limits
5. `newsletter` — RODO double opt-in
6. `dietary-profile` — persistent customer preferences (alergeny, makro, etc.)
7. `b2b-accounts` — konta firmowe + members + invoice cycles
8. `production` — production runs + delivery routes + kitchen labels + HACCP

### 11 admin routes (`/app/*`)
- Strefy dostawy / Sloty dostaw / Subskrypcje / Lojalność / SEO meta / AI Generator (z 1. PR)
- **Nowe dziś:** Produkcja (with print labels + manifests), Sposoby dostawy, Konta B2B, Newsletter

### 2 admin widgety (z 1. PR)
- Atrybuty cateringowe (na karcie produktu)
- Lojalność (na karcie klienta)

### 19 nowych API endpoints

**Store (publiczne, ze pub-key):**
- `GET /store/seo?path=...`
- `GET /store/postal-lookup?code=40-159`
- `GET /store/product-availability?product_id=...&date=...`
- `GET /store/dietary-profile`, `POST /store/dietary-profile`
- `POST /store/newsletter/signup`, `GET /store/newsletter/confirm`, `POST /store/newsletter/unsubscribe`
- `POST /store/b2b/register`
- `GET /store/subscriptions`, `POST /store/subscriptions`
- `POST /store/subscriptions/:id/pause`
- `POST /store/subscriptions/:id/skip`
- `POST /store/subscriptions/:id/swap-meal`
- `POST /store/subscriptions/:id/cancel`

**Admin (z JWT):**
- `GET/POST /admin/seo-meta`, `GET/POST/DELETE /admin/seo-meta/:id`
- `GET /admin/delivery-zones`
- `GET /admin/time-slots?date=...`
- `GET /admin/subscriptions`, `POST /admin/subscriptions/generate-orders`
- `GET /admin/loyalty/accounts`
- `GET/POST /admin/catering-attributes/:productId`
- `GET /admin/delivery-methods`, `POST /admin/delivery-methods`
- `GET /admin/production?date=...`, `POST /admin/production`
- `GET /admin/production/manifests?date=...`
- `GET /admin/production/labels?date=...`
- `GET/POST /admin/routes`
- `GET/POST /admin/b2b-accounts`
- `GET /admin/newsletter`

### Storefront — analytics + SEO + nowe strony

**Analytics (`lib/analytics/*` + `components/analytics/*`):**
- 17 typowanych eventów (GA4 + Shopify Pixels mapping)
- GTM bootstrap z Google Consent Mode v2 (default = denied)
- ConsentBanner z 3 trybami (Accept all / Reject / Customize)
- PageViewTracker (route change)
- `view_item` na PDP, `add_to_cart` na AddToCart, `zone_checked` na PostalLookup, `generate_lead` na NewsletterSignup

**SEO (`lib/seo/*` + `app/sitemap.ts` + `app/robots.ts`):**
- Dynamic sitemap.xml (28 URL po deployu)
- robots.txt (allow LLM bots GPTBot/ClaudeBot/PerplexityBot)
- 5 JSON-LD factories (LocalBusiness, WebSite, Product, Breadcrumb, FAQPage, ItemList)
- `buildMetadata()` z admin override fallback
- `generateMetadata()` na: `/`, `/menu`, `/produkt/[slug]`, `/konfigurator`, `/lunch`, `/dla-firm`, `/dostawa`, `/o-nas`, `/regulamin`, `/polityka-prywatnosci`, `/zwroty`, `/newsletter/potwierdzenie`

**Nowe strony:**
- `/newsletter/potwierdzenie?token=...` — RODO confirm flow
- `/regulamin` — skeleton z TODO placeholdami (do uzupełnienia treścią prawną)
- `/polityka-prywatnosci` — skeleton z TODO placeholdami
- `/zwroty` — reklamacje + prawo odstąpienia (art. 38)
- `/konto/profil-zywieniowy` — formularz alergeny/diety/cele kaloryczne

**Nowe komponenty:**
- `<PostalLookup>` (in /dostawa, /menu, dowolnie)
- `<NewsletterSignup>` (in Footer)
- `<DietaryProfileForm>` (in /konto/profil-zywieniowy)
- `<TrackProductView>`, `<TrackItemList>`
- `<ConsentBanner>`, `<GtmScript>`, `<GtmNoscript>`, `<PageViewTracker>`

### Maile (Resend provider)

**Templates (9 total):**
- `renderOrderConfirmation` (pre-existing)
- `renderDeliveryEta` (pre-existing)
- `renderB2BQuoteFollowUp` (pre-existing)
- **Nowe:** PaymentCaptured, OrderShipped, OrderDelivered, AbandonedCart, B2BLeadReceived, WelcomeCustomer

**Subscribers (6 total):**
- `order-placed-email` (pre-existing)
- **Nowe:** order-payment-captured, order-fulfillment-shipped, order-fulfillment-delivered, customer-created-welcome, b2b-lead-received

**Cron job:**
- `abandoned-cart-recover` (daily 17:00)

### Dokumentacja

- `docs/STAN_OBECNY.md` (105 linii)
- `docs/FEATURE_GAP_ANALYSIS.md` (160 linii) — vs Maczfit/NTFY/Bodychief
- `docs/DELIVERY_LOGIC.md` (152 linie) — żywa dokumentacja modułu dostaw
- `docs/DECISIONS_LOG.md` (111 linii) — 14 decyzji architektonicznych
- `docs/BUGS_REMAINING.md` (141 linii) — 22 known issues z priorytetami
- `docs/INTEGRATION_GUIDE.md` (z 1. PR — runbook dla GTM/Resend/Search Console)

---

## Co działa od razu (po deploy)

Po `git push origin main` (już zrobione, commit a3b418b z 1. PR):

✅ Sitemap.xml: https://catering-slaski.vercel.app/sitemap.xml (28 URL)
✅ Robots.txt: https://catering-slaski.vercel.app/robots.txt
✅ JSON-LD na PDP: Product + Breadcrumb
✅ Dynamic metadata na wszystkich kluczowych stronach
✅ Consent banner się renderuje przy pierwszym odwiedzeniu
✅ PageViewTracker emituje page_view do dataLayer (czeka na GTM)
✅ Admin: `/app/seo-meta`, `/app/delivery-zones`, `/app/subscriptions`, `/app/loyalty`, `/app/ai-generator` — wszystko zwraca 401 (auth) → istnieje

## Co działa po dzisiejszym pushu (czeka na merge + deploy + migracje)

Po push commitu z tej sesji + `pnpm db:migrate` na Railway:

⏳ `/store/postal-lookup` — pełny lookup po kodzie pocztowym
⏳ `/store/newsletter/signup` + `/confirm` + `/unsubscribe`
⏳ `/store/dietary-profile` (wymaga auth)
⏳ `/store/product-availability`
⏳ `/store/b2b/register`
⏳ `/store/subscriptions` + 4 actions
⏳ Admin: `/app/production`, `/app/delivery-methods`, `/app/b2b-accounts`, `/app/newsletter`
⏳ Print labels + print manifests w admin produkcji
⏳ Footer ze stopką: newsletter signup + regulamin/polityka/zwroty

## Co NIE jest zrobione i wymaga decyzji właściciela

❌ **B-1:** Custom endpointy zone-lookup/time-slots 500 — wymaga Railway logs
❌ **B-3:** Produkty Supabase → Medusa — wymaga uruchomienia importera
❌ **B-5:** Seed danych: postal_codes per strefa, supported_methods
❌ **B-9, B-10:** Klucze RESEND_API_KEY + GTM_ID — wymagają decyzji+kont
❌ **Treść prawna:** regulamin, polityka prywatności, zwroty (skeleton z TODO)
❌ **Foto produktów:** wciąż placeholdery (osobny task biznesowy)
❌ **DPD/InPost API:** integracja API (np. etykiety, tracking)
❌ **TSP solver:** auto-router tras kierowców (potrzebny mapbox lub OSRM)

---

## Test E2E (curl)

Po deployu z migracjami:

```bash
BACKEND=https://backend-production-ebee.up.railway.app
PUBKEY=pk_0bf0uyaqn34q4ua1ncql6icshypvmqhbcgb66lxq06fx32nj8tnphjp7wtfge13s

# Test 1: postal lookup (po seedzie postal_codes)
curl "$BACKEND/store/postal-lookup?code=40-159" -H "x-publishable-api-key: $PUBKEY"

# Test 2: newsletter signup
curl -X POST "$BACKEND/store/newsletter/signup" \
  -H "x-publishable-api-key: $PUBKEY" -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","consent_text":"Wyrażam zgodę...","source":"test"}'

# Test 3: product availability
curl "$BACKEND/store/product-availability?product_id=prod_xyz&date=2026-05-22" \
  -H "x-publishable-api-key: $PUBKEY"

# Test 4: B2B register
curl -X POST "$BACKEND/store/b2b/register" \
  -H "x-publishable-api-key: $PUBKEY" -H "Content-Type: application/json" \
  -d '{"name":"Testowa Sp. z o.o.","legal_name":"Testowa Sp. z o.o.","vat_number":"1234567890","primary_contact_name":"Jan Kowalski","primary_contact_email":"jan@testowa.pl","account_type":"smartlunch","billing_address":{"street":"ul. Testowa 1","city":"Katowice","postal_code":"40-001"},"smartlunch_subsidy_cents":1500}'

# Test 5: admin production (wymaga JWT)
curl "$BACKEND/admin/production?date=2026-05-22" -H "Cookie: $JWT"
```

---

## Co rekomenduję na rano (priorytet operacyjny)

1. Sprawdź czy Railway zbudował commit (poczekaj ~5min po pushu)
2. `railway run pnpm db:migrate` — utwórz 7 nowych tabel
3. `railway run pnpm exec medusa exec ./src/scripts/seed-delivery-methods.ts`
4. **Decyzja:** Wkleić zone seeds — najlepiej zrobić to przez admin UI `/app/delivery-zones` (postal_codes + supported_methods) ALBO napisać `seed-delivery-zones-v2.ts` (jeśli mam plik z zone-config + kody, rzucę go w godzinę)
5. Założyć GTM container (5 min) + Resend account (5 min) + ustawić envy
6. Uruchomić importer Supabase → Medusa
7. Otworzyć https://backend-production-ebee.up.railway.app/app → przejść po nowych menu
8. Otworzyć https://catering-slaski.vercel.app/dostawa → wpisać "40-001" w PostalLookup
9. Otworzyć https://catering-slaski.vercel.app/sitemap.xml → potwierdzić 28+ URL
10. **Decyzja:** treść prawna regulaminu/polityki (skeleton z TODO jest)

---

## Git

Branch: `feat/full-catering-shop` (push w trakcie)
Commit messages — atomowe, jeden tematycznie spójny commit z opisem.
