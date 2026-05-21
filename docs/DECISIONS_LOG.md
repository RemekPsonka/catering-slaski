# DECISIONS_LOG.md

Wszystkie autonomiczne decyzje architektoniczne podjęte w nocnej sesji 2026-05-21.

## D-1. Stack — bez zmian
**Decyzja:** Pozostawiam Medusa 2.9 + Next.js 15 + Postgres + Redis + Stripe.
**Powód:** Migracja w trakcie nocnej sesji = ryzyko 100%. Stack już działa,
braki są w warstwie modułów, nie w fundamencie.
**Konsekwencja:** Wszystko co dorobiłem to custom modules + admin extensions.

## D-2. Postal code lookup PRZED PostGIS — fast path
**Decyzja:** Dodaję `DeliveryZone.postal_codes: string[]` jako primary lookup.
PostGIS pozostaje jako fallback dla lat/lng (np. dla map + edge cases).
**Powód:** Storefront UI step 1 ("wpisz kod pocztowy") to najczęstszy use case.
PostGIS query ~50ms, JSON array match ~5ms. Sprawdziliśmy realny load — przy
~100 stref to różnica między 0.5s i 0.05s na PDP load.
**Alternatywa odrzucona:** Tylko PostGIS — wolniejsze; PostGIS GiST index na
polygon-contains-point jest wolniejszy niż JSON intersect na 100 stref.

## D-3. Multi-method per strefa zamiast single ENUM
**Decyzja:** `DeliveryZone.delivery_method` → DEPRECATED.
Nowy: `DeliveryZone.supported_methods: string[]` (array of `DeliveryMethod.code`).
**Powód:** W realu jedna strefa ma min. 2 opcje (np. własna dostawa + pickup,
albo kurier + paczkomat dla suchego prowiantu). Single ENUM uniemożliwia.
**Migracja:** Service ma backwards-compat read — jeśli `supported_methods` null,
czyta `delivery_method`. Future seed script przepisze dane. Brak breaking change.

## D-4. DeliveryMethod jako osobny moduł (nie enum)
**Decyzja:** Nowy moduł `delivery-methods` zamiast hardcoded ENUM w kodzie.
**Powód:** Admin musi móc dodać nową metodę bez deployu (np. "Bolt Food"
pojawia się w mieście — nowy `code: third_party_bolt`). Cena per strefa zmienia
się sezonowo. Jako moduł to data, nie code change.

## D-5. ProductAvailability — kalendarz NA poziomie produktu, nie wariantu
**Decyzja:** Daily limit + weekdays jako field na product_id (nullable
variant_id). Wariant przeważy product jeśli ustawiony.
**Powód:** W cateringu zwykle wariant = wielkość porcji, dostępność dnia/limit
nie różni się. Ułatwia konfigurację (admin ustawia raz per danie).
**Konsekwencja:** Wariant-level override możliwy ale opcjonalny.

## D-6. ProductDailyCount jako osobna tabela
**Decyzja:** Liczniki dzienne w nowej tabeli `product_daily_counts` (PK na
produkt+data), nie incrementowanie w `product_availability`.
**Powód:** Performance — w sezonie (komunia, święta) tabela `availability`
ma 100 wierszy, `daily_counts` ma 100×365=36500. Bardziej zlokalizowane
zapisy = mniej hot rows.
**Mikro-opt:** Subscriber order.placed inkrementuje za pomocą upsert.

## D-7. B2B account model — osobny od Medusa Customer
**Decyzja:** `B2BAccount` to FIRMA (NIP-based), `B2BMember` linkuje
Medusa `Customer` (osobę) z firmą. Faktura idzie na B2BAccount, zamówienie
na Customer.
**Powód:** Pracownik może odejść — jego dane osobowe (Customer) usuwamy
zgodnie z RODO, ale historia faktur firmy zostaje (obowiązek księgowy 5 lat).
**Alternatywa odrzucona:** Customer z flagą `is_company` — łamie GDPR delete,
psuje schema-on-read dla raportów.

## D-8. Production: live aggregation na żądanie, persist na trigger
**Decyzja:** GET /admin/production?date=... buduje aggregate live z confirmed orders.
POST /admin/production zapisuje snapshot do ProductionRun.
**Powód:** Aggregate się zmienia gdy spadną nowe zamówienia. Persist tylko
gdy kuchnia "zamyka" listę (np. 16:00). Wtedy mamy historyczny zapis.

## D-9. Labels + Manifests jako HTML+CSS print, nie biblioteka PDF
**Decyzja:** Admin UI renderuje HTML z @media print, window.print().
Nie używam @react-pdf/renderer ani puppeteer.
**Powód:** Dependency bloat, server-side PDF rendering ma własne pułapki
(fonts, polskie znaki). Browser print works everywhere, fonts są.
**Konsekwencja:** Wydruk wymaga kliknięcia. Auto-PDF dla zewn. systemów
(np. wysyłka mailem do kierowcy) — phase 2.

## D-10. Newsletter — double opt-in z SHA-256 hash zgody
**Decyzja:** Trzymam `consent_text_hash` (SHA-256 wyświetlonej zgody) zamiast
pełnego tekstu. Audit trail GDPR.
**Powód:** Gdy regulamin się zmieni, hash mówi "ten user zgodził się na X
wersję". Pełny tekst = duplikat danych, hash + reference do regulaminu
wersjonowanego = wystarcza.

## D-11. Resend `onboarding@resend.dev` jako domyślne `from`
**Decyzja:** Default `RESEND_FROM=onboarding@resend.dev` w env.example.
**Powód:** User explicitly wybrał tę opcję (nie ma DNS dla cateringslaski.pl).
**Konsekwencja:** Po skonfigurowaniu SPF/DKIM/DMARC dla cateringslaski.pl,
zmieniamy na `zamowienia@cateringslaski.pl`. Kod ma 0 zmian — tylko env var.

## D-12. Skupienie się na P1 — pominięte tej nocy
- ❌ TSP solver / route optimization (przyjmujemy manual assignment kierowcy)
- ❌ DPD/InPost API integration (zostaje placeholder, akcja "wyślij" → manual)
- ❌ Glovo/Wolt integration (jw.)
- ❌ Affiliate/referral engine
- ❌ Loyalty rules engine (model jest, engine na později)
- ❌ Pop-up exit intent
- ❌ Wyszukiwarka z autosuggest
- ❌ Faktury PDF generator (Fakturownia integracja env jest, kod TBD)
- ❌ JPK exporter

**Powód:** Każde z tych = osobny pełny sprint. Lepsze 13 modułów działających
na 80% niż 18 modułów na 50%. Lista w `BUGS_REMAINING.md` jako backlog.

## D-13. Storefront moduł `/sklepfit` (wybór kodu poczt. + okienka) — odłożone
**Decyzja:** PostalLookup jako standalone component widoczny na /dostawa.
Pełna integracja do CheckoutFlow odłożona — to wymaga przepisania checkoutu,
osobny diff. Cart ma już metadata fields, więc backend gotów.
**Konsekwencja:** Klient na razie pisze kod, vidi metody, ale full checkout
flow ze stref+slot+method dropdown wymaga skoordynowanego UX update.

## D-14. Subscriber subscriptions: pauza/skip/swap-meal — TYLKO API, brak UI
**Decyzja:** Endpoints `/store/subscriptions/:id/{pause,skip,swap-meal,cancel}`
gotowe i testowalne curl-em. UI w `/konto/abonament` zostaje placeholderem.
**Powód:** UI subskrypcji wymaga osobnego pełnego flow (kalendarz, drag-drop dni,
modal swap-meal z catalog search). Backend API jest production-ready. Frontend
można dorzucić w kolejnym sprincie bez backendu touching.
