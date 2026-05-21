# Feature Gap Analysis — Catering Śląski vs konkurencja

**Konkurencja porównana:** Maczfit, Nice To Fit You (NTFY), Bodychief, Smaczne Pudełko, Lite Cuisine + generic e-commerce baseline (Shopify).

🔴 = krytyczne (brak = sklep nie sprzedaje)
🟡 = ważne (przewaga konkurencyjna)
🟢 = nice-to-have

## A. Strefy / dostawy

| Feature | NTFY | Maczfit | Bodychief | Shopify | Catering Śląski (obecnie) | Priorytet |
|---|---|---|---|---|---|---|
| Lookup po kodzie pocztowym | ✅ | ✅ | ✅ | ❌ (płatny app) | ⚠️ Tylko lat/lng | 🔴 |
| Lookup po geofencing | ❌ | ❌ | ❌ | ❌ | ✅ PostGIS | 🟢 (już mamy) |
| Multi-method per strefa | ✅ (kurier + odbiór) | ✅ | ✅ | ✅ | ❌ Single ENUM | 🔴 |
| Delivery days per strefa | ✅ | ✅ | ✅ | — | ❌ | 🔴 |
| Okienka czasowe per strefa | ✅ | ✅ | ✅ | ⚠️ App | ✅ | OK |
| Cut-off dynamic per slot | ✅ | ✅ | ✅ | ⚠️ App | ⚠️ Statyczne (per strefa) | 🟡 |
| Daily/slot capacity | ✅ | ✅ | ✅ | ⚠️ App | ✅ | OK |
| Free delivery threshold | ✅ | ✅ | ✅ | ✅ | ✅ | OK |
| Min. order per strefa | ✅ | ✅ | ✅ | ✅ | ✅ | OK |
| Strefa "out of range" — zapisz na newsletter | ✅ | ✅ | ✅ | ❌ | ❌ | 🟡 |

## B. Produkt / katalog

| Feature | NTFY | Maczfit | Bodychief | Shopify | Catering Śląski | Priorytet |
|---|---|---|---|---|---|---|
| Atrybuty żywieniowe (kcal, makro) | ✅ | ✅ | ✅ | ⚠️ Custom | ⚠️ Częściowe (catering_attr) | 🔴 |
| Alergeny — flaga + filtr wyklucz | ✅ | ✅ | ✅ | ⚠️ App | ⚠️ Flaga jest, filtr brak | 🔴 |
| Kalendarz dostępności dań (per weekday) | ✅ | ✅ | ✅ | ❌ | ❌ | 🔴 |
| Daily production limit per danie | ✅ | ✅ | ✅ | ⚠️ Inventory ≈ | ❌ | 🔴 |
| Plany dietetyczne (1000-3000 kcal) | ✅ | ✅ | ✅ | — | ❌ | 🟡 (catering eventowy ≠ pudełka dietetyczne) |
| Zestawy / bundles | ✅ | ✅ | ✅ | ✅ | ⚠️ Częściowe | 🟡 |
| Recenzje i oceny dań | ✅ | ✅ | ✅ | ⚠️ App | ❌ | 🟡 |
| SEO per produkt (meta, JSON-LD) | ✅ | ✅ | ✅ | ✅ | ✅ (dziś) | OK |
| Schema.org Recipe | ❌ | ❌ | ❌ | — | ⚠️ Mamy Product, brak Recipe | 🟢 |
| Galeria zdjęć | ✅ | ✅ | ✅ | ✅ | ⚠️ Placeholder | 🟡 (foto = osobny task biznesowy) |

## C. Checkout

| Feature | NTFY | Maczfit | Shopify | Catering Śląski | Priorytet |
|---|---|---|---|---|---|
| One-page checkout | ✅ | ✅ | ✅ | ⚠️ Multi-step (lepsze dla catering) | OK |
| Guest checkout | ✅ | ✅ | ✅ | ⚠️ Tak (Medusa default) | OK |
| BLIK | ✅ | ✅ | ✅ (via PayU/Przelewy24) | ⚠️ Tylko jeśli Stripe.pl skonfigurowany | 🔴 |
| Apple/Google Pay | ✅ | ✅ | ✅ | ⚠️ Stripe domyślnie | OK (deps OK) |
| Faktura VAT auto | ✅ | ✅ | ⚠️ App | ❌ Env jest, integracji brak | 🔴 dla B2B |
| Address autocomplete | ✅ | ✅ | ✅ (Google) | ⚠️ Custom AddressPicker | 🟡 |
| Instrukcje dla kierowcy | ✅ | ✅ | ⚠️ Custom field | ❌ | 🔴 |
| Voucher / kod rabatowy | ✅ | ✅ | ✅ | ⚠️ Medusa promotions module domyślny | OK |
| Porzucony koszyk recovery | ✅ | ✅ | ✅ | ✅ (dziś dodane) | OK |

## D. Konto klienta

| Feature | NTFY | Maczfit | Bodychief | Catering Śląski | Priorytet |
|---|---|---|---|---|---|
| Login + social | ✅ | ✅ | ✅ | ⚠️ Auth domyślny Medusa | 🟡 |
| Mój kalendarz dostaw | ✅ | ✅ | ✅ | ❌ | 🔴 |
| Powtórz zamówienie 1-click | ✅ | ✅ | ✅ | ❌ | 🟡 |
| Adresy wielokrotne | ✅ | ✅ | ✅ | ⚠️ Strona jest, dane brak | 🟡 |
| Profil żywieniowy persistent | ✅ | ✅ | ✅ | ❌ | 🟡 |
| Pauza / skip abonamentu | ✅ | ✅ | ✅ | ❌ (model jest) | 🔴 dla abonamentu |
| Zmiana menu na konkretny dzień | ✅ | ✅ | ✅ | ❌ | 🟡 |

## E. B2B / SmartLunch

| Feature | NTFY B2B | Maczfit B2B | SmartLunch.pl | Catering Śląski | Priorytet |
|---|---|---|---|---|---|
| Konto firmowe (NIP) | ✅ | ✅ | ✅ | ❌ | 🔴 |
| Multi-user na konto | ✅ | ✅ | ✅ | ❌ | 🔴 |
| Dofinansowanie pracodawcy | — | — | ✅ | ❌ | 🟡 |
| Faktura miesięczna zbiorcza | ✅ | ✅ | ✅ | ❌ | 🔴 |
| Credit limit | ✅ | ✅ | ✅ | ❌ | 🟢 |

## F. Marketing / Growth

| Feature | NTFY | Maczfit | Shopify | Catering Śląski | Priorytet |
|---|---|---|---|---|---|
| Newsletter double opt-in | ✅ | ✅ | ✅ | ❌ | 🔴 RODO |
| Welcome discount | ✅ | ✅ | ✅ | ❌ | 🟡 |
| Referral / affiliate | ⚠️ | ✅ | ⚠️ App | ❌ | 🟡 |
| Loyalty engine | ⚠️ | ✅ | ⚠️ App | ⚠️ Schema, brak engine | 🟡 |
| Email automations | ✅ | ✅ | ✅ (Klaviyo) | ✅ (6 templates dziś) | OK |
| GA4 + Meta Pixel + GTM | ✅ | ✅ | ✅ | ✅ (dziś) | OK |
| Pop-up exit intent | ⚠️ | ⚠️ | ⚠️ App | ❌ | 🟢 |
| Cookie consent | ✅ | ✅ | ✅ App | ✅ (dziś) | OK |

## G. Admin / Operacje

| Feature | NTFY | Maczfit | Shopify | Catering Śląski | Priorytet |
|---|---|---|---|---|---|
| Dashboard KPI | ⚠️ | ⚠️ | ✅ | ❌ | 🟡 |
| Panel produkcyjny "co ugotować" | ✅ | ✅ | ❌ | ❌ | 🔴 |
| Drukowanie etykiet | ✅ | ✅ | ⚠️ App | ❌ | 🔴 |
| Trasówka kierowcy + mapa | ✅ | ✅ | ❌ | ❌ | 🔴 (P1 dla cateringu) |
| Refund + reklamacje | ✅ | ✅ | ✅ | ⚠️ Medusa default | 🟡 |
| Multi-warehouse | ⚠️ | ⚠️ | ⚠️ App | ⚠️ Medusa supports | OK |
| Eksport CSV | ✅ | ✅ | ✅ | ⚠️ Medusa default | OK |
| Role/RBAC | ⚠️ | ✅ | ✅ | ⚠️ Medusa users default | 🟡 |
| HACCP log | ✅ (kuchnie regulowane) | ✅ | ❌ | ❌ | 🟡 (compliance) |

## H. Storefront UX

| Feature | NTFY | Maczfit | Shopify | Catering Śląski | Priorytet |
|---|---|---|---|---|---|
| Mobile-first | ✅ | ✅ | ✅ | ✅ | OK |
| Lighthouse 90+ | ⚠️ 70-85 | ⚠️ 70-85 | ⚠️ 70-85 | ⚠️ Niezmierzone | 🟡 |
| Wyszukiwarka z autosuggest | ⚠️ | ✅ | ✅ | ❌ | 🟡 |
| Filtr po dietach/alergenach | ✅ | ✅ | ⚠️ App | ⚠️ FilterSidebar napisany, brak engine | 🔴 |
| Sticky cart | ⚠️ | ✅ | ✅ | ⚠️ CartBadge w headerze | OK |
| Food photography forward | ✅ | ✅ | — | ⚠️ Placeholder | 🟡 (biznesowe) |

## I. Compliance / Legal (PL)

| Feature | Wymagane | NTFY | Maczfit | Catering Śląski | Priorytet |
|---|---|---|---|---|---|
| RODO consent | ✅ | ✅ | ✅ | ✅ (dziś) | OK |
| Alergeny widoczne (UE 1169/2011) | ✅ | ✅ | ✅ | ⚠️ Dane są, prominent display TBD | 🔴 |
| Wartości odżywcze per 100g | ✅ | ✅ | ✅ | ❌ | 🟡 |
| Regulamin / polityka prywatności | ✅ | ✅ | ✅ | ❌ (TODO content) | 🔴 |
| Polityka zwrotów / reklamacji | ✅ | ✅ | ✅ | ❌ | 🔴 |
| Paragon fiskalny / e-paragon | ✅ | ✅ | ✅ | ❌ | 🔴 (B2C) |
| JPK | ✅ (księgowa) | ✅ | ✅ | ❌ | 🟡 (faktury → JPK przez Fakturownia) |

---

## Plan nocnej sesji — sprint backlog

**P1 — MUST HAVE (do rana 100%):**
- Postal code lookup → strefa
- Multi-method per strefa
- Delivery days per strefa
- Product availability calendar (per weekday + daily limit)
- Driver instructions na cart/order
- Panel produkcyjny + raport "co ugotować"
- Listy załadunkowe (PDF)
- Etykiety wydruku (PDF)
- Trasówka + driver assignment
- Filtr po dietach/alergenach (engine)
- BLIK info + Stripe.pl readiness (env-driven, finalna konfiguracja przez user)
- Customer dietary profile
- Newsletter double opt-in
- Regulamin/polityka skeletony

**P2 — SHOULD HAVE (do rana 80%):**
- Abonamenty UI: pauza, skip, change menu per dzień
- B2B SmartLunch: konto firmowe + multi-user + faktura zbiorcza
- Mój kalendarz dostaw (konto klienta)
- Powtórz zamówienie 1-click
- Welcome discount automation
- Loyalty engine (rules + auto-tier)
- Refund flow

**P3 — IF TIME:**
- Affiliate/referral
- HACCP log
- Pop-up exit intent
- Lighthouse perf audit
- Schema.org Recipe per produkt
- Wyszukiwarka z autosuggest
