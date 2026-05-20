# Catering Śląski — Strategia Redesignu Platformy 2026
### Autonomiczna propozycja gotowa do podjęcia decyzji

---

## TL;DR — Co proponuję w jednym akapicie

Przebudować Catering Śląski z prymitywnego sklepu na ec-instant-site w **nowoczesną platformę AI-first dla cateringu eventowego i lunch B2B/B2C na Śląsku**. Stack: Next.js 15 + Sanity + Supabase + Stripe + AI (Claude/GPT) + Vercel. Trzy filary wyróżnienia: **(1) AI Generator Menu Eventowego** — pierwszy w Polsce, gdzie firma wpisuje brief ("100 osób, 80 zł/os, vege, koktajl party") i dostaje gotową propozycję w 15 sekund; **(2) Top-tier design** — premium dark + gold + cream zamiast generic SaaS look; **(3) GEO/AI SEO** — pozycjonowanie nie tylko w Google ale i w ChatGPT/Perplexity/Gemini, gdzie 40% userów już szuka. Roadmap 5 faz × 2-4 tygodnie każda. Pierwszy efekt produkcyjny w 6 tygodni od decyzji.

---

## 1. Diagnoza obecnego sklepu (cateringslaski.pl)

### Co działa
- **Solidna marka regionalna** — nazwa, domena, zasięg 20+ miast Śląska
- **Realne testimoniale** (238 rodzin) — to można 10× rozszerzyć
- **Czytelna oferta BOX** — 200+ produktów w sensownych kategoriach (koktajlowy, finger food, sałatkowy, słodki, etc.)
- **Lokalność** — odbiór osobisty w Dąbrowie Górniczej, 2 strefy dostawy (29/49 zł)
- **Cena** — pricing transparentny (190-370 zł za box)

### Co jest słabością krytyczną
1. **Brak prawdziwych zdjęć jedzenia** — placeholder images z CloudFront, na "Najczęściej zamawiane" i testimonialach Unsplash stockowe. **TO ZABIJA KONWERSJĘ.** Food sprzedaje wzrokiem.
2. **og:image puste** — przy udostępnieniu w social/komunikatorach pojawia się nic. Tracone setki kliknięć miesięcznie.
3. **Platforma sztywna** — ec-instant-site nie pozwala na konfigurator, AI, custom UX, prawdziwe SEO.
4. **Brak konfiguratora B2B** — firma chcąca event musi pisać/dzwonić. Tracisz natychmiastową sprzedaż.
5. **Brak lunch/codzienny** — przegapiasz segment regularnych zamówień firmowych (highest LTV).
6. **Generyczny design** — wygląda jak każdy inny mały sklep z SaaS template'a. Nie ma USP wizualnego.
7. **Słabe SEO** — meta-descriptions OK ale brak schema.org dla produktów, brak GEO, brak content marketingu.
8. **Brak konta** — userzy nie wracają, brak listy ulubionych, historii zamówień.
9. **Brak filtrów** — przy 200 produktach trzeba: wege/wegan/bezglutenowe/lekkie/cena/liczba osób/okazja.
10. **Storytelling = 0** — śląskość, tradycja, kuchnia regionalna — nieopowiedziane.

### Konkurencja i benchmarki

| Konkurent | Mocna strona | Słabość | Lekcja |
|---|---|---|---|
| **Tele Catering** (Śląsk) | Lokalność, B2B | Sztywne menu | Wprowadzić konfigurator |
| **Catering Żarełko** (Cieszyn) | Konfigurator | Mały zasięg | Ich konfigurator → nasz AI |
| **Compass Group** (PL) | Skala B2B | Korporacyjny chłód | My ciepły + tech |
| **Pajda Catering** (W-wa) | Codzienny lunch | Tylko Warszawa | Replikacja modelu na Śląsk |
| **U Barborki** (W-wa B2B) | Premium | Nie ma online ordering | My — premium + online |
| **ezCater** (USA) | Marketplace + UX | USA only | Pełna inspiracja UX |
| **Sweetgreen** (US) | Top UX, design system | Restauracja | Wzorzec menu/checkoutu |
| **HelloFresh** | Onboarding, konfigurator | Tylko meal kit | Konfigurator dla nas |

### Rynek
- **PL catering: 13,6 mld € do 2028** (z 10,6 w 2023, +3,9% rocznie)
- **B2B corporate: 1,8 mld USD** (główny segment, +7% rocznie)
- **Online delivery food PL: +25% rocznie**
- **Remote work meals: +30%** — nowa kategoria
- **40% userów AI search** — Twoja przyszłość to GEO, nie tylko Google

---

## 2. Burza mózgów — 4 perspektywy

### Manager Gastro mówi:
> "Mam 200 produktów ale klient nie wie co wybrać. Potrzebuję go prowadzić ZA RĘKĘ. Dla B2C lunch: dziś jest wtorek, dam mu top 3 dania dnia, deadline do 16:00. Dla B2B event: niech mi powie ile osób, jaki budżet, jaki klimat — ja (AI) ułożę menu. Dla powtarzających klientów: 'zamów to samo co miesiąc temu' jednym kliknięciem. **Konwertuj decyzję, nie pokazuj katalogu.**"

**Konsekwencje dla platformy:**
- "Smart suggestions" na karcie produktu — "Pasuje do: BOX koktajlowy II"
- One-click reorder
- Domyślne menu sugerowane dla typu eventu (chrzciny, komunia, urodziny 40+, event firmowy)
- Auto-bundling przekąsek + napojów + obsługi

### Marketing mówi:
> "Catering Śląski to świetna nazwa ale nikt nie wie kim jesteśmy. Musimy zbudować **autorytet regionalny + autorytet AI search**. Content jako 'szef kuchni opowiada': historia śląskich potraw, gotowanie na komunię, ile dań na osobę. Lokalne SEO Katowice/Sosnowiec/DG. Schema.org dla każdego BOX. Optymalizacja pod GEO — gdy ktoś pyta ChatGPT 'najlepszy catering Śląsk', mamy być cytowani. **Strategy hybrydowa: 60% SEO klasyczne + 40% GEO**."

**Konsekwencje dla platformy:**
- Blog z prawdziwym contentem (nie AI bełkot, AI assist + ekspertyza)
- Schema.org `Product`, `Recipe`, `Restaurant`, `LocalBusiness`, `FAQPage`
- Optymalizacja meta + og:image PRAWDZIWE zdjęcia
- Wzmianki o lokalizacjach w treści (semantic SEO)
- Knowledge base do AI search ("Ile finger foodów na osobę na koktajl party?")
- Newsletter z personalizacją (Klaviyo)
- Programy lojalnościowe + Polecaj znajomemu (z kodem)
- Google Business + Apple Maps + Booksy/Bookero (eventy)

### Sprzedaż mówi:
> "B2B nie kupi z koszyka. **Lead nurturing musi być natychmiastowy.** Firma wypełnia konfigurator → dostaje od razu PDF z ofertą na maila → sprzedawca dostaje notyfikację → telefon w 60 minut. Ale dla B2C lunch — checkout jak Amazon. **Karta + BLIK + Apple Pay, 3 kroki max.** Subskrypcje dla firm: 'co tydzień we wtorek na 10 osób'. Faktury VAT automatycznie."

**Konsekwencje dla platformy:**
- Dwie ścieżki: B2C (express checkout) + B2B (oferta + kontakt)
- Generator PDF ofert z brandingiem (puppeteer / pdf-lib)
- CRM integracja (HubSpot lub Pipedrive) — leady B2B
- Stripe Subscriptions dla powtarzających się zamówień
- Fakturownia API dla auto-faktur VAT
- Notyfikacje SMS dla sprzedawcy (Twilio)
- Live chat (Intercom — masz już) + AI bot dla typowych pytań

### UX mówi:
> "Mobile-first. 70% ruchu z telefonu. Konfigurator nie może mieć więcej niż 4 ekrany. AI Generator Menu — chat-like interface, nie formularz. Checkout = jedna strona, 4 pola, koniec. Speed jest king — LCP < 1.5s. Dark mode opcja (premium feel). Animacje dyskretne — nie tańczące burritos. **Każdy click = postęp w decyzji, nigdy nie wraca.**"

**Konsekwencje dla platformy:**
- Next.js + Server Components dla speed
- Image optimization (Next/Image + Cloudinary lub własne CDN)
- Skeleton loading + optimistic UI
- Konfigurator: 3-4 kroki, progress bar
- Sticky CTA "Dodaj do koszyka" / "Wygeneruj ofertę"
- A/B testing built-in (PostHog feature flags)

---

## 3. Stack techniczny — moje rekomendacje

### Decyzja architektoniczna
Odradzam Shopify Plus dla Twojego case'u — pisałem wczoraj w czacie. Cateringi mają tak nietypową logikę (deadline'y zamówień, konfiguratory, wycena dynamiczna, faktury VAT PL, BLIK, strefy dostaw), że Shopify będzie kulą u nogi. **Custom Next.js + headless CMS** to dziś standard dla tego typu projektów. Tańsze long-term, pełna kontrola, top SEO i AI integracja natywnie.

### Stack rekomendowany

| Warstwa | Narzędzie | Dlaczego | Koszt/mies. |
|---|---|---|---|
| **Frontend + API** | Next.js 15 (App Router) | Top SEO, server components, AI SDK natywnie | $0 (Vercel free tier dla startu) |
| **Hosting** | Vercel | Masz już połączony, Edge functions, ISR | $0-20 (Hobby/Pro) |
| **CMS produkty + content** | Sanity Studio | Masz już połączony, schema-first, świetny do food | $0 (free do 3 userów) |
| **Baza zamówienia + użytkownicy** | Supabase (PostgreSQL) | Auth + DB + realtime + storage w jednym | $0-25 (free/Pro) |
| **Płatności** | Stripe | BLIK przez Stripe, Apple/Google Pay, subskrypcje | 1.4% + 0.25 zł |
| **Faktury VAT** | Fakturownia API | Auto-faktury, polskie standardy, KSeF ready | ~50 zł/mies |
| **AI Generator Menu** | Anthropic Claude API + OpenAI GPT-4 fallback | Top jakość rozumienia briefu, polski | ~$30-100 (zależne od użycia) |
| **AI SEO content** | Claude API + własna baza wiedzy | Generator opisów, blog assist, GEO content | wliczone wyżej |
| **Email transakcyjny** | Resend | Best DX, polski sender domain, templaty React | $0-20 |
| **Email marketing** | Klaviyo lub Brevo | Newsletter, segmentacja, automation | $0-50 |
| **Analityka** | Vercel Analytics + Plausible + PostHog | Privacy-first, GDPR OK, product analytics | $0-25 |
| **CRM B2B** | HubSpot Free lub Pipedrive | Leady eventowe, follow-up | $0 (start) |
| **Chat support** | Intercom (masz!) + Crisp jako tańsza opcja | AI bot + human handoff | masz |
| **Media/CDN** | Cloudinary lub Sanity Assets | Zdjęcia jedzenia, optymalizacja, transforms | $0-50 |
| **Map / strefy dostaw** | Mapbox + custom GeoJSON | Strefy 1/2 wizualnie, sprawdzanie kodu pocztowego | $0 (free tier) |
| **Monitoring** | Sentry + BetterStack | Error tracking, uptime, logs | $0-30 |

**Łącznie miesięcznie: ~150-400 zł/mies dla startu**, skaluje się z ruchem. Vs. Shopify Plus = ~2000 USD/mies fix.

### Integracje "życzeniowe" które dodajemy w fazach 3-5

- **InPost API** — Paczkomaty dla nieperishable produktów (boxy słodkie, suchy box)
- **Furgonetka** — własna sieć kurierów lokalnych
- **Booksy/Bookero** — rezerwacje obsługi kelnerskiej
- **Polskie BLIK** — przez Stripe (Apple Pay/Google Pay w pełni działają)
- **Google Business Profile API** — automatyczna aktualizacja godzin/menu
- **Apple Business Connect** — pojawianie się w Apple Maps
- **TikTok Shop** — dla food contentu z Instagram/TikTok jeśli sensowne

---

## 4. Design Direction

### Brand mood
**Premium domowy** = ciepło rodziny + jakość restauracyjna + duma śląska.
Nie "fine dining gourmet", nie "tania stołówka". Środek: catering, któremu zaufasz na komunię dziecka **i** event firmy.

### Paleta kolorów (proponowana)

```
PRIMARY (Background dark mode):
  Deep Forest    #0B2818 ← główne tło, premium, organiczne
  Coal Black     #0A0908 ← najgłębsze cienie
  
NEUTRAL (Light surfaces):
  Warm Cream     #F4EFE6 ← kolor talerza, ciepło
  Linen          #E8E0D0 ← drugi neutral
  
ACCENT (CTA, highlights):
  Burnt Gold     #C9A961 ← luksusowy akcent, śląska duma
  Ember Orange   #D97742 ← apetytowy CTA dla "kup"
  Tomato Red     #C73E1D ← deadline, urgency, "ostatnie sztuki"
  
SEMANTIC:
  Forest Success #2D5A3D ← potwierdzenia, dostępne
  Amber Warning  #E0A458 ← uwagi, deadline'y
  Crimson Error  #B0413E ← błędy, brak miejsc
```

### Typography
- **Display (nagłówki, hero)**: **"Fraunces"** — modern serif z charakterem, idealny do food (Google Fonts free)
- **Body (paragrafy, UI)**: **"Inter"** — czysty, czytelny, system font feel
- **Display alt**: **"Instrument Serif"** dla quotes/storytelling

### Visual style
- **Full-bleed food photography** w hero — prawdziwe zdjęcia, ciepłe, kontrastowe, top-down i 3/4
- **Mesh gradients** subtelne na backgroundach (gold/forest blend)
- **Editorial layouts** — typografia jak w magazynie kulinarnym, nie jak e-commerce
- **Mikro-animacje** — fade-in on scroll, parallax delikatny, hover scale 1.02 max
- **Dark mode default** dla hero + AI generator (premium feel), light dla katalogu/checkoutu

### Komponenty designu (shadcn/ui jako baza)
- Buttons: 3 warianty (primary gold, ghost cream, danger tomato)
- Cards: produkty z hover effect, glass-morphism dla overlay'ów
- Chips: alergeny, wege/vegan/glutenfree, na każdej karcie produktu
- Sticky bar: koszyk zawsze widoczny na mobile

---

## 5. Funkcjonalności — co MUSI być, co warto, co później

### MUSI (Faza 1-2, MVP-production)
- ✅ Landing page z hero, USP, kategoriami, social proof
- ✅ Katalog 200 produktów z PRAWDZIWYMI zdjęciami (sesja zdjęciowa = priorytet)
- ✅ Karta produktu z opisem, alergenami, "Pasuje do", "Dla ilu osób"
- ✅ Koszyk z deadline'em (do 16:00 na jutro dla lunch)
- ✅ Checkout jedna strona, guest checkout, BLIK + karta + Apple/Google Pay
- ✅ Konto użytkownika z historią + reorder
- ✅ Mapa stref dostaw + sprawdzanie kodu pocztowego
- ✅ Mobile-first, PWA-ready
- ✅ FAQ + Polityki + Strony statyczne
- ✅ Schema.org + sitemap + meta tags + og:image PRAWDZIWE
- ✅ Panel admin (Sanity Studio + Supabase Dashboard + custom orders view)

### WARTO (Faza 3, mocne wyróżnienie)
- 🎯 **Konfigurator B2B Event** — kreator menu dla firm krok-po-kroku
- 🎯 **AI Generator Menu** — wpisujesz brief, dostajesz propozycję z wyceną
- 🎯 Generator PDF ofert z brandingiem
- 🎯 Tryb B2B: NIP, faktura VAT auto, terminy płatności
- 🎯 Subskrypcje Stripe dla powtarzających zamówień
- 🎯 Fakturownia integracja
- 🎯 SMS notyfikacje (Twilio) dla sprzedawcy
- 🎯 Live chat AI (z masz Intercom) + handoff

### PÓŹNIEJ (Faza 4-5, optymalizacja i skala)
- 📈 Loyalty program z punktami
- 📈 Polecaj znajomemu z kodem
- 📈 Blog z AI assist + GEO optymalizacja
- 📈 Newsletter automation (Klaviyo)
- 📈 A/B testing (PostHog)
- 📈 Multi-warehouse jeśli wejdziesz w inne regiony
- 📈 Mobile app (React Native via Expo) — tylko jeśli volume to uzasadni
- 📈 White-label dla franczyzy

---

## 6. AI — jak konkretnie wbudowujemy

### A. AI Generator Menu Eventowego (flagowa feature)
**User experience:**
```
Klient wpisuje (chat-style):
"100 osób, urodziny 40-stka, sobota wieczór, 
80 zł/osoba, 30% wegetariańskie, koktajl party 
bez ciepłych dań."

AI w 15 sekund zwraca:
✅ 12 propozycji koniecznych BOX'ów (z naszego katalogu)
✅ Wyliczone porcje per osoba
✅ Bilans menu (mięso/ryba/vege/słodkie)
✅ Cena: 7,840 zł brutto (98% budżetu)
✅ Sugestię dostawy (Strefa 1, 29 zł)
✅ Notatkę: "Sugeruję 10% buffer na nieobecnych gości"
✅ Przycisk "Pobierz PDF oferty" + "Zarezerwuj termin"
```

**Pod spodem:**
- Claude API (sonnet 4.5) z system promptem
- Retrieval z Sanity (katalog produktów jako kontekst)
- Reguły biznesowe (porcje per typ eventu, kombinatoryka menu)
- Output formatowany jako JSON structured + readable PDF

### B. AI Asystent w Live Chat
- Odpowiedzi na FAQ
- Sprawdzanie dostępności
- Eskalacja do human jeśli pyta o coś nietypowego

### C. AI w SEO/Content
- Generator opisów produktów (z brand voice)
- Blog posts z research (AI + human review)
- Meta descriptions automatic
- Schema.org auto-generation
- GEO content (FAQ pages optymalizowane pod ChatGPT/Perplexity)

### D. AI Personalizacja (faza 4+)
- "Też zamawiali" rekomendacje
- "Czas zamówić ponownie" przypomnienia
- Smart bundling w koszyku
- Dynamic pricing dla mało popularnych pozycji

---

## 7. Roadmap — 5 faz, ~5-6 miesięcy do pełnej platformy

### FAZA 1 — Fundament + Design (3-4 tyg)
**Cel:** stoi działający landing + nowa identyfikacja
- [ ] Setup Next.js + Vercel + Sanity + Supabase
- [ ] Design system w Figma (kolory, typo, komponenty)
- [ ] Brand refresh (logo, sygnet, kolory, ton)
- [ ] Schema produktów w Sanity
- [ ] Landing page (live)
- [ ] Strony statyczne (O nas, Kontakt, Dostawa, FAQ, Realizacje)
- [ ] Schema.org + og:images + meta
- [ ] **Sesja zdjęciowa 50 top BOXów** (priorytet jakości fotografii!)

**Deliverable:** nowy landing live na cateringslaski.pl, stary sklep dalej działa pod /sklep tymczasowo.

### FAZA 2 — Sklep B2C + Checkout (4-5 tyg)
**Cel:** klient może zamówić online z karty i BLIK
- [ ] Katalog 200 produktów z prawdziwymi zdjęciami
- [ ] Karta produktu + filtry (alergeny, wege, cena, liczba osób)
- [ ] Koszyk z deadline'em (do 16:00 na jutro)
- [ ] Mapa stref dostaw + walidacja kodu pocztowego
- [ ] Checkout jedna strona (Stripe Checkout lub Elements)
- [ ] BLIK + karta + Apple/Google Pay
- [ ] Konto użytkownika (Supabase Auth + magic link)
- [ ] Historia zamówień + reorder
- [ ] Email transakcyjny (Resend) — potwierdzenie, status, faktura
- [ ] Fakturownia integracja → auto-faktura VAT
- [ ] Panel admin orders (custom Next.js + Supabase)

**Deliverable:** pełny sklep B2C live, migracja klientów ze starego.

### FAZA 3 — Konfigurator B2B + AI Generator (5-6 tyg)
**Cel:** firma może w 3 min stworzyć ofertę eventową
- [ ] Konfigurator event step-by-step (typ eventu, liczba osób, budżet, restrykcje)
- [ ] **AI Generator Menu** — Claude API + reguły + katalog
- [ ] Wycena dynamiczna
- [ ] Generator PDF oferty z brandingiem
- [ ] Tryb B2B: NIP, faktura VAT, terminy płatności
- [ ] CRM integracja (HubSpot Free) — leady eventowe
- [ ] SMS notyfikacje sprzedawcy (Twilio)
- [ ] Live chat AI (Intercom Fin AI lub własny chat)

**Deliverable:** flagowa feature działa, 1-2 case studies z prawdziwymi klientami.

### FAZA 4 — Subskrypcje + Content + GEO SEO (3-4 tyg)
**Cel:** pasywne przychody + autorytet w AI search
- [ ] Stripe Subscriptions (lunch firmowy co tydzień)
- [ ] Blog z AI assist + 20 wartościowych artykułów
- [ ] GEO optymalizacja (FAQ pages, schema, citations)
- [ ] Newsletter Klaviyo + automation flows
- [ ] Loyalty points + referral codes
- [ ] Multi-language (PL/EN) jeśli wchodzą międzynarodowi klienci

**Deliverable:** ranking w ChatGPT/Perplexity dla "catering Śląsk", "catering firmowy Katowice".

### FAZA 5 — Optymalizacja, skala, mobile app (ongoing)
- [ ] A/B testing (PostHog) — conversion optimization
- [ ] Heat-mapy + session replays (Hotjar lub PostHog)
- [ ] Performance audit (Lighthouse 95+)
- [ ] PWA → opcjonalnie native app (Expo)
- [ ] Ekspansja na sąsiednie regiony (Kraków, Wrocław) jako stretch
- [ ] White-label dla franczyzy (opcjonalnie)

---

## 8. KPI — co mierzymy

### Faza 1-2 (sprzedażowe)
- **Conversion rate** koszyk → checkout: cel >40% (vs typowe 25%)
- **Konwersja landing → karta produktu**: cel >25%
- **Średnia wartość zamówienia (AOV)**: cel +30% vs obecne (push do upsell)
- **Mobile conversion**: cel parity z desktop (dziś typowo 50%)
- **LCP (Largest Contentful Paint)**: cel <1.5s
- **CLS (Cumulative Layout Shift)**: cel <0.1

### Faza 3 (B2B + AI)
- **Lead → telefon w 60 min**: cel 80%
- **Lead → wycena → zamówienie**: cel >25%
- **AI Generator usage**: cel 50%+ wizyt B2B
- **NPS** po zamówieniu: cel >70

### Faza 4 (marketing)
- **Organic traffic +50%** vs Q1
- **Cytowania w AI search** — 5+ głównych zapytań
- **Email open rate**: cel >35%
- **Subscription MRR**: pierwsze 50 firm na lunch

---

## 9. Co rano znajdziesz w plikach

| Plik | Co zawiera |
|---|---|
| `STRATEGIA.md` | Ten dokument |
| `index.html` | Strona startowa — przewodnik po wszystkich mockupach |
| `01-landing.html` | Nowy landing page (top of funnel) |
| `02-konfigurator-b2b.html` | Konfigurator eventowy + AI Generator Menu (live demo) |
| `03-sklep-b2c.html` | Katalog + karta produktu (B2C lunch / box) |
| `04-checkout.html` | Mega prosty 1-page checkout |
| `05-konto.html` | Panel klienta z historią zamówień |

Każdy mockup to **w pełni klikalna interaktywna prezentacja** — możesz wejść w nią z telefonu lub kompa, kliknąć, zobaczyć jak to ma działać. To nie statyczny mockup z Figmy. To **prawdziwy HTML, taki sam stack którego użyjemy w produkcji**.

---

## 10. Co decydujesz po obejrzeniu

Po przeglądnięciu rano potrzebuję od Ciebie 3 decyzje:

1. **Czy idziemy z tym stackiem?** (Next.js + Sanity + Supabase + Stripe) lub wolisz iterować propozycję?
2. **Czy design direction Ci odpowiada?** (dark + gold + cream, premium domowe) lub jedziemy w inną stronę?
3. **Od czego zaczynamy — Faza 1 czy AI Generator pilotaż jako proof?**

Mam plan zaczyna budować w produkcji natychmiast po Twojej akceptacji — pierwszy działający landing w 2-3 tygodnie, pełny sklep B2C w 6-8 tygodni.

---

*Dokument przygotowany autonomicznie przez Claude w trybie research → strategy → mockup, 19 maja 2026, ~2h pracy.*
