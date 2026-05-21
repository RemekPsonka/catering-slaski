# Catering Śląski — Stan Obecny (2026-05-21, godz. 21:30)

Audyt wykonany w nocnej sesji zgodnie z instrukcją FAZA 1.

## 1. Architektura — co już stoi

| Warstwa | Stack | Status | URL |
|---|---|---|---|
| Storefront | Next.js 15 + React 19 + Tailwind | ✅ Deployed (Vercel) | catering-slaski.vercel.app |
| Backend | Medusa.js 2.9 + Node 24 + tsx | ✅ Deployed (Railway) | backend-production-ebee.up.railway.app |
| Admin UI | Medusa 2.9 dashboard + custom extensions | ✅ /app | /app (login: r.psonka@nono.pl) |
| Database | Postgres 17 (Supabase, eu-central-1) | ✅ ACTIVE_HEALTHY | ygddbgigduduazmppsst |
| Redis | Upstash | ✅ | champion-panda-132821 |
| AI | Anthropic Claude Sonnet 4.6 | ✅ Wired in `/store/ai/generate-menu` | — |
| Płatności | `@medusajs/payment-stripe` w configu | ⚠️ Brak STRIPE_* envów | — |
| Maile | Resend provider + 9 templates + 6 subscribers | ✅ Kod gotowy, ⚠️ brak RESEND_API_KEY | — |
| Analytics | GTM + Consent Mode v2 + 17 typowanych eventów | ✅ Kod gotowy, ⚠️ brak NEXT_PUBLIC_GTM_ID | — |
| SEO | sitemap, robots, JSON-LD (LocalBusiness, Product, Breadcrumb, FAQPage, WebSite), admin-editable meta | ✅ Live | /sitemap.xml |

## 2. Moduły Medusa (custom) — co mamy

| Moduł | Status | Co robi | Limit/brak |
|---|---|---|---|
| `delivery-zones` | ✅ Live | Strefy z PostGIS polygon, cut-off, fee, lead time | Single `delivery_method` ENUM — brak multi-method |
| `time-slots` | ✅ Live | Sloty z capacity + SlotReservation | Brak method_code, brak per-zone cut-off offset |
| `catering-attributes` | ✅ Live | Per-product: kcal, alergeny, vegan, GF, portions | Brak filtra po allergens excluded |
| `subscriptions` | ✅ Schema | Plany 5/10/20/30 dni, generator zamówień | Brak UI pauza/skip/change menu per dzień |
| `loyalty` | ✅ Schema | Points + tiery | Brak engine reguł, brak public API |
| `external-webhooks` | ✅ | Konfiguracja outbound (production, logistics) | OK |
| `seo-meta` | ✅ Nowe (dziś) | Path-based override dla meta tagów | OK |
| `resend-notification` | ✅ Nowe (dziś) | Provider do Notification module | OK |

## 3. Storefront — co jest

| Strona | Status | SEO | Analytics |
|---|---|---|---|
| `/` | ✅ | ✅ Organization+WebSite JSON-LD | ✅ page_view |
| `/menu` | ✅ | ✅ generateMetadata | ✅ page_view |
| `/produkt/[slug]` | ✅ | ✅ Product+Breadcrumb JSON-LD | ✅ view_item |
| `/konfigurator` | ✅ (AI brief form) | ✅ | ✅ page_view; brak generate_lead |
| `/koszyk` | ⚠️ Działa lokalnie (zustand), nie spina się z Medusa | — | brak view_cart |
| `/checkout` | ⚠️ Komponent CheckoutFlow napisany, nie zweryfikowany E2E | — | brak begin_checkout |
| `/konto/*` | ⚠️ Strony są, brak realnych danych (no auth flow) | noindex (sluszne) | — |
| `/lunch`, `/dla-firm`, `/dostawa`, `/o-nas` | ✅ | ✅ dynamic metadata | ✅ |
| `/zamowienie/[token]` | ⚠️ Public order tracking — nie zweryfikowany | noindex | — |

## 4. Dane

- **Supabase `cs.products`**: 21 produktów (boxy, dania, lunch) — to obecne źródło dla `lib/products.ts`
- **Medusa `product` table**: 0 produktów (Region + Sales Channel istnieje)
- **Storefront fallback**: Medusa → Supabase → empty array
- ⚠️ Konsekwencja: cart/checkout używają Medusa SDK ale produktów tam nie ma → real-add-to-cart pójdzie nie tak. Importer `import-from-supabase.ts` napisany, nie uruchomiony.

## 5. Operacje — co JEST a czego NIE MA dla cateringu

### Jest:
- Strefy z PostGIS lookup → zwraca strefę dla lat/lng
- Time slots z capacity + reservation z TTL
- Cut-off (per strefa, statyczne `cutoff_hour`)
- AI Generator (Anthropic) z `/store/ai/generate-menu`
- Subscriber chain: order.placed → email, billing, production webhook, logistics webhook

### Brakuje (krytyczne dla cateringu):
1. **Postal code lookup** — wpisanie kodu pocztowego nie wskazuje strefy (tylko lat/lng przez geocoding)
2. **Multi-method per strefa** — jedno `delivery_method` per zone; w realu jedna strefa ma kilka opcji (własna + pickup, lub kurier + paczkomat)
3. **Delivery days per zone** — strefa "obowiązuje codziennie", brak konfiguracji "tylko pon-pt"
4. **Product availability calendar** — nie ma "menu wtorkowe" vs "menu sobotnie"
5. **Daily production limits** — nie ma "max 50 porcji łososia na czwartek"
6. **Driver instructions na zamówieniu** — brak kodu do bramy, piętra
7. **Trasówka** — brak przypisania zamówień do kierowcy + kolejność
8. **Etykiety wydruku** — brak generowania PDF z imieniem + alergenami + kodem
9. **Raport produkcyjny** — brak agregacji "co ugotować jutro"
10. **B2B SmartLunch** — żaden moduł firmy/dofinansowania nie istnieje
11. **HACCP log** — brak rejestrowania temperatur przy załadunku/dostawie
12. **Newsletter signup** — brak double opt-in flow
13. **Loyalty rules engine** — model jest, ale brak "1 PLN = 1 pkt" enforcera ani "VIP od 5000 PLN lifetime"
14. **Affiliate/referral** — brak
15. **Customer dietary profile** — brak persistent allergens/preferences/target kcal
16. **Reklamacje ze zdjęciami** — brak workflow
17. **Faktury VAT** — brak generatora (env `FAKTUROWNIA_*` jest, integracji brak)
18. **JPK, paragony fiskalne** — brak

## 6. Dług techniczny / niespójności

- `cs.products` (Supabase) i Medusa `product` rozjeżdżają się: importer napisany, nie uruchomiony
- `delivery-zones` ma kolizję migration historii (init_schema vs modules_extension — udokumentowane w memory `project_catering_slaski.md`)
- `subscriptions` w cs.subscriptions ma 2 schematy w historii migracji (init_schema vs modules_extension — modules_extension wygrał)
- Health endpoint backendu zwraca `redis: cacheService not resolved` — istnieje przed naszymi zmianami, do zbadania
- Custom routes `/store/zone-lookup`, `/store/time-slots` zwracają 500 — moduł zarejestrowany, ale handlerze coś się wykrzaczyło (do zbadania w logach Railway)
- Admin login flow Medusa 2.9 ma znany bug z empty JWT actor_id (workaround: SQL insert publishable key)

## 7. Co dziś (sesja 2026-05-21) zostało dodane

Commit `a3b418b`:
- Analytics layer + Consent banner + GTM bootstrap + 17 typowanych eventów (view_item + add_to_cart wired)
- Resend notification provider
- 6 nowych email templates + 5 nowych subscribers + 1 daily cron (abandoned cart)
- SEO module backend (seo_meta) + admin CRUD
- Storefront sitemap.ts, robots.ts, JSON-LD schemas, generateMetadata na wszystkich kluczowych stronach
- 6 admin routes: Strefy, Sloty, Subskrypcje, Lojalność, SEO meta, AI Generator
- 2 admin widgets: catering attributes (PDP), loyalty status (customer)
- Backing admin/* API endpoints
- Importer Supabase → Medusa product table

Pendant — ta nocna sesja dorzuca P1 (moduł dostaw enterprise-grade), P2 (panel produkcyjny, abonamenty UI), P3 (B2B SmartLunch, dietary profile, newsletter, JPK).
