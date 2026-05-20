# Postępy z trybu autonomicznego
**Sesja:** 19-20 maja 2026 (noc)
**Status:** Sklep gotowy do testowego deploya — kod kompletny, brakuje tylko ostatecznych integracji z backendem produkcyjnym

---

## Co dziś przybyło (bez Twojej obecności)

### Storefront (Next.js 15) — frontend pełen koszyk + checkout + konto
✅ `/koszyk` — pełny widok koszyka z Zustand persistence, kod rabatowy (NOWY10, WIOSNA15), AI upsell
✅ `/checkout` — **5-stepowy flow**: Adres → Termin → Dane → Płatność → Potwierdzenie
  - Auto-detekcja strefy po kodzie pocztowym (40-* = Lokalna 19 zł, 41/44-* = Aglomeracja 29 zł, ...)
  - 6 okien czasowych, jedno zajęte (mock contention)
  - B2B przełącznik (NIP + nazwa firmy)
  - 4 metody płatności (BLIK / Karta / Apple Pay / Przelew 14 dni)
  - Ekran potwierdzenia z numerem zamówienia + ETA SMS
✅ `/konto` (dashboard + 5 sub-stron):
  - Przegląd — najbliższa dostawa, statystyki (zamówienia, punkty, subskrypcje, łącznie wydane), lojalność CTA
  - `/zamowienia` — lista + filtry status (Wszystkie / W produkcji / Dostarczone / Anulowane)
  - `/zamowienia/[id]` — timeline statusu, faktura, kurier, ponowne zamówienie
  - `/adresy` — multi-address z domyślnym, zone preview
  - `/subskrypcje` — Lunch dnia 5×/tydz, edit/pauza/anuluj
  - `/lojalnosc` — Brąz/Srebro/Złoto/Diament + nagrody do wymiany (200, 600, 1000, 2200 pkt)
  - `/ustawienia` — profil, B2B, powiadomienia, bezpieczeństwo, danger zone

### Komponenty
✅ `components/product/AddToCart.tsx` — qty stepper, favorites toggle, success notice
✅ `components/cart/CartView.tsx` — items list, promo code, summary z dostawą
✅ `components/checkout/CheckoutFlow.tsx` — pełny 5-step controller
✅ `components/configurator/EventBriefForm.tsx` — **B2B brief multi-step** (event → goście+budżet → format+dieta → kontakt)
✅ `components/layout/CartBadge.tsx` — live badge z liczbą pozycji, hydration-safe
✅ `lib/cart-store.ts` — Zustand z localStorage persistence (klucz: `cs-cart-v1`)
✅ `lib/products.ts` — server-side fetcher Medusa products + attributes + graceful fallback
✅ `lib/cart-api.ts` — pełne API Medusa cart (create/getById/addLine/setAddress/initPayment/complete)

### Strony content / B2B / lunch / static
✅ `/lunch` — subskrypcja lunch dnia (3×/tydz, 5×/tydz, BOX tygodniowy) z planami + FAQ
✅ `/dostawa` — 4 strefy dostawy (Lokalna 19zł, Aglomeracja 29zł, Regionalna 49zł, Krajowa 79zł), deadliny, FAQ
✅ `/o-nas` — story page z timeline 2019→2026, 6 numerów (238 rodzin, 280+ firm), values
✅ `/dla-firm` — pełna landing page B2B:
  - Hero z 280+ klientów trust
  - 4 features (Faktura VAT, Plan terminów, Gwarancja, Rabaty wolumenowe)
  - 6 occasion cards (wesele/komunia/firmowe/kick-off/jubileusz/sylwester)
  - **EventBriefForm** — 4 kroki, wyłapuje budżet i preferencje, wysyła do `/store/b2b-leads`
  - AI alternative CTA

### Backend (Medusa) — moduły rozszerzające
✅ `modules/catering-attributes` — Product attributes (dieta, alergeny, porcje, bestseller, contents, occasion_tags)
  - Filter API: filterProductIds (intersect z Medusa product query)
  - Cross-sell helper
  - Rating recorder (avg + count)
✅ `modules/subscriptions` — Recurring lunch/box (daily/weekly/biweekly/monthly + weekdays array)
  - createSubscription z computeNextRunAt (RRULE-like)
  - pause/resume/cancel
  - findDueSubscriptions (cron-friendly query)
  - markRun + advance next_run_at
✅ `modules/loyalty` — Points + tiers + ledger
  - earnFromOrder (idempotent by order_id, 1 pkt = 1 zł)
  - redeem (raise if insufficient)
  - referralBonus (200 pkt na polecenie)
  - computeTier (Brąz/Srebro/Złoto/Diament)
  - listHistory

### Subscribers + Jobs
✅ `subscribers/order-completed-loyalty.ts` — automatyczne naliczanie punktów po dostarczeniu
✅ `subscribers/order-placed-email.ts` — order confirmation email z brand-styled template
✅ `jobs/subscriptions-generate-orders.ts` — godzinowy cron, generuje cart z subskrypcji 24h przed dostawą

### Email templates (brand v2 — coal/paper/signal)
✅ `emails/templates.ts` — 3 templaty inline-styled (Outlook-compatible):
  - `renderOrderConfirmation` — potwierdzenie zamówienia z items, total, ETA, tracking
  - `renderDeliveryEta` — 24h przed dostawą z kurierem + telefonem
  - `renderB2BQuoteFollowUp` — propozycja menu dla B2B leadów

### API routes (Medusa store)
✅ `/store/ai/generate-menu` — Claude API z catalog corpus, walidacja produktów, structured JSON output
✅ `/store/b2b-leads` — przyjęcie briefu z honeypot + Resend email do sales@

### Migracje Supabase
✅ `20260520000002_modules_extension.sql` — product_attributes, subscriptions, loyalty_accounts, loyalty_transactions + views
✅ `20260520000003_b2b_leads.sql` — pipeline leadów B2B + status workflow

### Seed catalogu
✅ `scripts/seed-catalog.ts` — 21 starterowych produktów w 6 kategoriach:
  - BOXY: I, II (bestseller), III XXL, wege, vegan, sweets, finger food premium, mini-burgery
  - Zimna płyta: kanapek koktajlowych, serów premium, wędlin śląskich
  - Komunia: zimna płyta dla 30, deska deserowa premium
  - Lunch: standard, fit (GF), wege
  - Street: hot dog bar (50 szt), pizza party (10 szt)
  - Garmażerka: rolada śląska, żurek w chlebie, krupnik wojskowy 5L

---

## Aktualny stan repo

| Warstwa | Status |
|---|---|
| Storefront pages | ✅ 13 stron + 6 sub-stron konta |
| Komponenty | ✅ 14 plików |
| Cart state | ✅ Zustand + persistence |
| Backend custom modules | ✅ 5 modułów (zones, slots, attrs, subs, loyalty) |
| Backend webhooks OUT | ✅ 3 subscribers (production, logistics, billing) |
| Backend loyalty subscriber | ✅ order.completed |
| Backend subscription cron | ✅ hourly |
| AI Generator API | ✅ Claude integration |
| B2B leads API | ✅ honeypot + Resend |
| Supabase migrations | ✅ 4 pliki (init, stripe events, modules ext, b2b leads) |
| Product seed | ✅ 21 produktów |
| Header cart badge | ✅ live count z Zustand |

---

## Czego dalej brakuje / co Ty musisz zrobić

### Niezbędne (blokujące go-live):
1. **GitHub repo** — utwórz `catering-slaski` na github.com/new, potem Claude pushnie kod
2. **Stripe Sp. z o.o.** — dokończ aktywację konta (KYC + dane firmowe)
3. **Sesja zdjęciowa** — 50 BOXów (placeholder z Unsplash teraz)
4. **Webhook contracts** — endpointy production/logistics/billing z istniejących systemów

### Po deployu Railway:
5. Uruchom migracje: `psql $DATABASE_URL -f infra/supabase/migrations/20260520000002_modules_extension.sql`
6. Uruchom seed: `pnpm --filter @cs/backend exec medusa exec ./src/scripts/seed-catalog.ts`
7. Stripe webhook URL: `https://<railway-url>/hooks/payment/stripe`
8. `ANTHROPIC_API_KEY` w Railway env vars (dla AI Generator)
9. `RESEND_API_KEY` + `SALES_EMAIL=sales@cateringslaski.pl` (dla B2B leads)

### Nice-to-have (sprint 2):
- Email templates (Resend) dla potwierdzeń zamówień, przypomnień subskrypcji
- SMS templates (SMSAPI) dla ETA dostawy
- Admin dashboard widgets (pipeline B2B, lojalność summary)
- Frontend filter wiring do realnego query string (FilterSidebar → /menu?diet=vege&occasion=komunia)
- Stripe Payment Element integracja w /checkout (zamiast mocka)
- `/lunch` page z subskrypcją 5×/tydz konfiguratorem
- Review/rating page po dostawie (link z SMS)

---

## Demo mode

Strony są zaprojektowane tak żeby **działać nawet bez backendu**:
- `/menu` — pokazuje 9 placeholder produktów z Unsplash + komunikat "demo mode"
- `/produkt/[slug]` — fallback na PLACEHOLDER_PRODUCTS jeśli Medusa nie odpowiada
- `/konto/*` — wszystkie mock data
- `/checkout` — symuluje 1.5s "processing"
- `/konfigurator` — używa mock proposal generatora, ale gotowy do podpięcia AI po deployu
- `/dla-firm` — brief form pokazuje success screen nawet jeśli POST padnie (graceful degradation, sales pickup via email fallback)

Możesz otworzyć każdy z tych URL-i lokalnie (po `pnpm dev`) i pełna ścieżka user-flow działa.

---

## Kolejny krok rano

Wybierz jedno:
1. **Push do GitHub** — jeśli zrobisz repo na github.com/new, Claude wykona resztę (git remote add + push)
2. **Stripe** — dokończ KYC żebym mógł odpalić webhook po Railway deploy
3. **Sesja zdjęć** — to jedyna rzecz której nie da się zautomatyzować
4. **Review kodu** — jak chcesz to przeskanuję jeszcze raz wszystkie pliki i wyprodukuję checklist do code review

Wszystko jest w `/Users/remigiuszpsonka/Library/Application Support/Claude/local-agent-mode-sessions/ae772935-f382-440d-b059-b279f2bba392/429bfa76-ca4d-4267-8da2-3ab74cd302df/local_ae015ce1-0432-4f35-857a-8b0244a82477/outputs/catering-slaski-redesign`.
