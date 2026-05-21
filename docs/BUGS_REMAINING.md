# BUGS_REMAINING.md

Lista znanych braków/bugów po nocnej sesji 2026-05-21.
Posortowane: ❗ krytyczne, ⚠️ ważne, ℹ️ kosmetyczne.

## ❗ Krytyczne (blokują production)

### B-1. Custom store endpoints zwracają 500 (poprzednie deployy)
- **Co:** `/store/zone-lookup`, `/store/time-slots` zwracają 500 — wpadło już
  przed dzisiejszą sesją (poprzedni deploy backendu).
- **Skutek:** Storefront PostalLookup pójdzie OK przez nowy `/store/postal-lookup`,
  ale fallback po lat/lng nie zadziała.
- **Hipoteza:** Service nie zlecznawia `delivery_zones` w container (niespójna
  rejestracja modułu po przerwie z init_schema vs modules_extension).
- **Action:** Po deploy z dzisiejszego commitu sprawdzić Railway logs.

### B-2. Migracje seo_meta + delivery_methods + product_availability + b2b + production + newsletter + dietary_profile NIE są jeszcze uruchomione
- **Co:** 7 nowych modeli wymaga `pnpm exec medusa db:migrate` po deploy.
- **Skutek:** Backend startuje OK ale endpointy zwracają błąd "table does not exist"
  jak tylko handler dotknie tabeli.
- **Action:** Po Railway deploy: `railway run pnpm db:migrate` (lub przez admin
  shell). Idempotentne — można puścić wielokrotnie.

### B-3. Produkty Supabase → Medusa nie zaimportowane
- **Co:** Importer `import-from-supabase.ts` napisany, nie uruchomiony.
- **Skutek:** `/store/products` zwraca pustą listę, storefront leci fallback na
  Supabase, ale Medusa cart/checkout nie znajdzie variant_id.
- **Action:** `railway run pnpm exec medusa exec ./src/scripts/import-from-supabase.ts`
- **Idempotent:** Tak, pomija istniejące handle.

## ⚠️ Ważne

### B-4. PostalLookup component w `/dostawa` — bez actualnego wstawienia w JSX
- **Co:** Import dodany, ale `<PostalLookup />` nie wstawione do treści strony
  (potrzebny ręczny insert w specific section dostawa/page.tsx — JSX tej strony
  ma niestandardową strukturę).
- **Skutek:** Component istnieje + jest exportowany, da się go użyć na innych
  stronach (np. dorzuca się do `/menu` lub homepage'a hero), ale na `/dostawa`
  jeszcze niewidoczny.
- **Action:** Dodać `<PostalLookup />` w pierwszej sekcji `/dostawa/page.tsx`
  (manual edit, jeden line of JSX).

### B-5. DeliveryZone v2 — istniejące dane nie mają `postal_codes`, `supported_methods`
- **Co:** Schema rozszerzona, ale stare rekordy nie mają nowych pól (default null).
- **Skutek:** PostalLookup zwraca "no match" dla wszystkich stref, dopóki admin
  ich nie wypełni.
- **Action:** Seed `seed-zones-v2.ts` (TODO) lub ręcznie w adminie wpisać
  postal_codes + supported_methods per strefa.

### B-6. Subscriptions UI w storefront jest placeholder
- **Co:** `/konto/abonament` strona istnieje (`/konto/subskrypcje/page.tsx` z
  poprzedniego deploya), ale przyciski pause/skip/swap-meal nie są
  zaimplementowane.
- **Skutek:** Klient musi dzwonić, żeby zatrzymać abonament. Backend gotów,
  UI brak.
- **Action:** Kolejny PR — komponent `<SubscriptionManager />` z trzema modal-ami.

### B-7. B2B SmartLunch — brak UI signup form i pracowniczego flowu
- **Co:** Endpoint `/store/b2b/register` gotów, ale strona `/dla-firm` ma stary
  formularz "EventBriefForm" zamiast osobnego formularza B2B accounting.
- **Skutek:** Firmy mogą zarejestrować przez API/curl, nie przez UI.
- **Action:** Komponent `<B2BSignupForm />` + osobna podstrona `/dla-firm/smartlunch`.

### B-8. Health endpoint Medusa: `Could not resolve 'cacheService'`
- **Co:** GET /health w backend zwraca 200 ale z error o cacheService. Pre-existing.
- **Skutek:** Health check Railway/Vercel obvious failure (degraded), uptime
  monitoring widzi "yellow".
- **Hipoteza:** Medusa 2.9 zmienił API resolveru cache, custom health endpoint
  (`src/api/health/route.ts`) jeszcze używa starej nazwy.
- **Action:** Fix `req.scope.resolve("cacheService")` → odpowiednia nowa nazwa
  (vlikely `Modules.CACHE` lub `"cache"`).

### B-9. RESEND_API_KEY brak na Railway
- **Co:** Bez klucza Resend, provider loguje "would send" zamiast wysłać mail.
- **Skutek:** order.placed, payment.captured itd. → nic do klienta.
- **Action:** Założyć konto Resend → `railway variables set RESEND_API_KEY=re_...`.

### B-10. NEXT_PUBLIC_GTM_ID brak na Vercel
- **Co:** Bez GTM, script się nie ładuje, ale wszystko inne (consent banner, page_view)
  ciche bezskutecznie.
- **Skutek:** Brak danych w GA4/Meta Pixel.
- **Action:** Założyć GTM container → `vercel env add NEXT_PUBLIC_GTM_ID production`.

## ℹ️ Kosmetyczne / dług techniczny

### B-11. Brak Recipe schema.org per danie
- **Co:** PDP ma Product + Breadcrumb JSON-LD, brak Recipe.
- **Skutek:** SERP nie pokaże "rich snippet" z czasem przygotowania/kaloriami.
- **Action:** Dodać `buildRecipeJsonLd` w `lib/seo/schemas.ts`.

### B-12. Brak ukrycia okienek po cut-off w storefroncie
- **Co:** Backend `/store/time-slots` (jeśli zacznie odpowiadać po fix B-1)
  zwraca wszystkie sloty, klient code musi filtrować.
- **Skutek:** Klient widzi "zarezerwuj 7:00", klika, dostaje 409 (poszedł cut-off).
- **Action:** Filter w API: dodać `WHERE cutoff_at > NOW()` w service `time-slots`.

### B-13. Brak Lighthouse audit
- **Co:** Nie zmierzono perf po wszystkich zmianach. GTM script + consent banner
  dodają ~50kb.
- **Action:** Po następnym deployu: `lighthouse https://catering-slaski.vercel.app
  --output html --output-path /tmp/audit.html`.

### B-14. Wyszukiwarka — brak autosuggest
- **Co:** UI ma input search w headerze, brak backendu.
- **Action:** `/store/search?q=...` endpoint + Algolia/MeiliSearch/Postgres FTS.

### B-15. Faktury VAT — brak generatora
- **Co:** envy `FAKTUROWNIA_*` są, integracji brak.
- **Action:** Subscriber `order-paid-billing.ts` jest, wewnątrz wywołanie
  POST do Fakturowni API + zapis invoice_url do order.metadata.

### B-16. JPK / paragony fiskalne
- **Co:** Brak.
- **Action:** Integracja z systemem fiskalnym (np. eMszene, Fiskaln) lub
  outsourcing do Fakturowni (która już to robi).

### B-17. Affiliate/referral
- **Action:** Model `Referral` + endpoint, link unikalny per klient.

### B-18. Loyalty engine
- **Co:** Schema jest, brak auto-decrement/credit po order.completed.
- **Action:** Subscriber `loyalty-rules-engine.ts` z regułami konfigurowalnymi
  z admina.

### B-19. Recenzje produktów
- **Co:** Brak.
- **Action:** Model `Review` + admin moderation + sklejenie do Product JSON-LD
  `aggregateRating`.

### B-20. Realtime tracking kierowcy
- **Co:** Brak.
- **Action:** Mobile app dla kierowcy + WebSocket + leaflet mapa na konto klienta.

### B-21. Admin login flow Medusa 2.9 — empty JWT actor_id (z poprzednich notatek)
- **Co:** Po `/auth/admin/emailpass` JWT ma puste actor_id; /admin/* zwraca 401.
- **Workaround:** SQL insert publishable key dla store endpoints.
- **Action:** Zbadać dokładnie skąd — možna bug w Medusa 2.9 lub config mismatch.

### B-22. Brak HACCP raportu eksportu
- **Co:** Model `QualityCheck` jest, admin UI brak, eksport CSV brak.
- **Action:** `/admin/quality-checks` route + CSV download.
