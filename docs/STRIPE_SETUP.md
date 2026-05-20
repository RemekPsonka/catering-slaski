# STRIPE_SETUP.md — Konfiguracja Stripe dla Nono food sp. z o.o.

**Cel:** uruchomić konto Stripe dla **Nono food sp. z o.o.** (marka: Catering Śląski) z włączonymi: **BLIK + karta + Apple Pay + Google Pay**.
**Email konta:** r.psonka@nono.pl
**Czas:** ~45-60 min od początku do końca + weryfikacja Stripe (zwykle 1-3 dni roboczych).

> **Ważne:** Stripe wymaga że to **przedstawiciel firmy** (zwykle prezes zarządu lub prokurent) klika przez formularz i akceptuje warunki. Tego za Ciebie nikt nie zrobi — ani ja, ani księgowy. Ale walkthrough niżej prowadzi za rękę.

---

## Część A — Co przygotuj na biurku ZANIM zaczniesz (10 min)

Otwórz osobną kartę przeglądarki i miej pod ręką:

### Dokumenty firmowe Nono food sp. z o.o.

| Dokument | Gdzie znaleźć |
|---|---|
| **KRS** (numer 10-cyfrowy) | krs-online.com.pl lub ekrs.ms.gov.pl |
| **NIP** (10 cyfr) | KRS lub CEIDG |
| **REGON** (9 lub 14 cyfr) | KRS lub regon.stat.gov.pl |
| **Pełna nazwa firmy** | Dokładnie jak w KRS: "Nono Food sp. z o.o." (sprawdź wielkość liter!) |
| **Adres siedziby** | Z KRS |
| **Data rejestracji** | Z KRS, dział "Dane podstawowe" |
| **PKD główny** | Dla cateringu zwykle 56.21.Z (Przygotowywanie i dostarczanie żywności dla odbiorców zewnętrznych) |

### Twoje dane jako przedstawiciel firmy

(Stripe pyta jako "Business representative" — czyli osoba uprawniona do reprezentacji w KRS, zwykle prezes zarządu / wspólnik)

- Imię i nazwisko
- Data urodzenia (DD/MM/RRRR)
- Adres zamieszkania (nie firmowy!)
- Numer telefonu komórkowego (Stripe wysyła SMS verification)
- PESEL lub numer paszportu
- Stanowisko w firmie (Director / Manager / Owner)
- Procent udziałów w firmie

### Konto bankowe firmowe

- **IBAN** pełny (PL + 26 cyfr) — z konta firmowego, nie osobistego
- Bank (mBank / Santander / PKO BP / itd.)
- Nazwa właściciela konta — musi się zgadzać z nazwą firmy w KRS

### Beneficjenci rzeczywiści (UBO — osoby z >25% udziałów)

Lista osób fizycznych które posiadają >25% udziałów w Nono Food sp. z o.o. Dla każdej:
- Imię, nazwisko, data urodzenia, adres, PESEL, % udziałów

### Dane biznesowe

- **Strona www**: cateringslaski.pl (nawet jeśli jeszcze nie wystartowała — Stripe akceptuje)
- **Opis biznesu** (EN): "Catering services — corporate lunch and event catering. Order placement and payment processing for catering boxes, hot meals, and subscription-based corporate lunch packages."
- **Branża**: Restaurants — Catering services
- **Oczekiwany miesięczny obrót**: realistycznie podaj (np. "50 000 - 100 000 PLN" na start)
- **Średnia wartość transakcji**: ~300-500 PLN (dla BOX cateringowy)
- **Jak długo od wpłaty do dostarczenia usługi**: 0-7 dni

---

## Część B — Setup w panelu Stripe (~45 min)

### B.1 — Otwórz panel (2 min)

1. Po zalogowaniu na r.psonka@nono.pl → **dashboard.stripe.com**
2. **Lewy górny róg → otwórz selector firmy → "Create new account"** (jeśli widać już Nono Food — przeskocz)
3. **Activate your account** (na górze panelu, żółty pasek)

### B.2 — Country and business structure (5 min)

- **Country**: Poland
- **Currency**: PLN (Polski złoty)
- **Business type**: **Company** → wybierz **"Sp. z o.o. — Spółka z ograniczoną odpowiedzialnością"**
- **Industry**: Restaurants → **Catering services**

### B.3 — Business details (10 min)

Wypełnij dane firmy:

| Pole Stripe | Co wpisać |
|---|---|
| Legal business name | **Nono Food sp. z o.o.** (dokładnie jak w KRS) |
| Doing business as (DBA) | **Catering Śląski** (Twoja marka handlowa) |
| Tax ID (NIP) | Twój 10-cyfrowy NIP |
| KRS number | Numer KRS |
| Business address | Adres siedziby z KRS (street, postal code, city, region: Śląskie) |
| Business phone | Numer firmowy (+48...) |
| Business website | https://cateringslaski.pl |
| Product description (EN) | Skopiuj z Części A wyżej |

### B.4 — Business representative — TY (5 min)

Stripe pyta o osobę kontrolującą firmę. Jeśli jesteś prezesem / udziałowcem:

- ✅ Zaznacz: "I am the business representative"
- Imię, nazwisko, email, telefon
- Date of birth (DD/MM/YYYY)
- Home address (Twój prywatny, nie firmowy)
- Position: **Director** (dla prezesa) lub **Owner**
- Job title: "Prezes Zarządu" / "Wspólnik"

### B.5 — Beneficial owners — UBO (5 min)

**KAŻDY kto ma >25% udziałów**. Możliwe scenariusze:

**Scenario A — jesteś jedynym wspólnikiem (100%)**:
- ✅ "I am also the beneficial owner"
- Stripe ucina się tutaj (nie musisz dodawać dodatkowych osób)

**Scenario B — wspólników jest więcej**:
- Kliknij "Add beneficial owner"
- Dla każdej osoby >25%: imię, nazwisko, data urodzenia, adres, % udziałów

**Scenario C — udziałowiec jest inną firmą**:
- Wybierz "Business" i podaj jej dane (NIP, KRS, etc.)

### B.6 — Bank account (5 min)

- **Account holder name**: Nono Food sp. z o.o. (musi się zgadzać z firmą)
- **IBAN**: PL + 26 cyfr (z konta firmowego mBank/PKO/Santander/itd.)
- **Currency**: PLN

Stripe może wyświetlić "We'll do a test deposit of 1-2 PLN to verify the account" — zaakceptuj.

### B.7 — Public details (zobaczy klient na fakturze Stripe) (2 min)

- **Statement descriptor**: `CATERING SLASKI` (max 22 znaki, pokaże się na wyciągu klienta)
- **Shortened descriptor**: `CSLASKI`
- **Customer support phone**: +48 793 001 900
- **Customer support email**: zamowienia@cateringslaski.pl

### B.8 — Two-factor authentication (3 min)

**KRYTYCZNE** — bez 2FA Stripe nie aktywuje konta. Włącz:

- Settings → Account → Two-step authentication
- Najlepiej: aplikacja **Authy** lub **Google Authenticator** (nie SMS — SMS jest mniej bezpieczny)
- Zapisz **backup codes** w sejfie / Bitwarden

### B.9 — Submit for activation (1 min)

Klik **"Submit application"**. Stripe powie: *"We'll review your account within 1-3 business days"*.

W tym czasie dostaniesz **test API keys** i możesz już testować integrację. Live keys aktywują się po weryfikacji.

---

## Część C — Włącz metody płatności (10 min)

Po wysłaniu aplikacji idź do **Settings → Payment methods**:

### BLIK (krytyczne dla PL)

- Wyszukaj "BLIK" na liście
- Klik **"Turn on"**
- Stripe może zapytać o dodatkowe info (zwykle nic)
- ✅ Done

### Cards (Visa / Mastercard / Maestro)

- Powinno być **włączone domyślnie**
- Sprawdź czy: 3D Secure (Strong Customer Authentication) jest enabled — wymóg PSD2

### Apple Pay

- Klik "Turn on"
- Stripe poprosi o **domain verification**:
  - Pobiera plik `apple-developer-merchantid-domain-association`
  - Musimy go umieścić na `https://cateringslaski.pl/.well-known/apple-developer-merchantid-domain-association` — **ja to zrobię w storefront** po Twoim sygnale

### Google Pay

- Działa automatycznie razem z kartami
- ✅ Domyślnie włączone gdy włączysz cards

### Przelewy24 (opcjonalne)

- Dla klientów którzy nie używają BLIK
- Możesz włączyć, niska prowizja (~0.8% + 0.40 PLN)
- ✅ Polecam włączyć dla coverage

---

## Część D — Webhook (3 min — robisz po moim sygnale)

Po deployu backendu na VPS, vrócę do Ciebie z konkretnym URLem webhook. Wtedy:

1. **Settings → Webhooks → Add endpoint**
2. **URL**: `https://api.cateringslaski.pl/hooks/payment/stripe` (dam dokładnie po deploy)
3. **Events to send** — wybierz tylko te 8:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `charge.dispute.created`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. **Klik "Add endpoint"**
5. Skopiuj **Signing secret** (`whsec_...`) → wkleisz do `.env` jako `STRIPE_WEBHOOK_SECRET`

---

## Część E — Klucze API (2 min — robisz teraz)

**Developers → API keys**:

| Key | Co to | Gdzie wkleisz |
|---|---|---|
| **Publishable key** (`pk_test_...` lub `pk_live_...`) | bezpieczny, w frontendzie | `.env` → `STRIPE_PUBLISHABLE_KEY` |
| **Secret key** (`sk_test_...` lub `sk_live_...`) | NIGDY w frontend, tylko backend | `.env` → `STRIPE_API_KEY` |

**Test mode vs Live mode** (toggle u góry panelu):
- **Teraz**: użyj **test keys** (`pk_test_`, `sk_test_`). Można testować end-to-end bez prawdziwych pieniędzy.
- **Po aktywacji**: przełączysz na live keys

---

## Część F — Co masz mi wysłać (na koniec, jak skończysz)

Po skończeniu Części B-E przekaż mi (przez sejf hasło — Bitwarden Send / 1Password Share, nie czystym tekstem):

```
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_API_KEY=sk_test_...
STRIPE_ACCOUNT_ID=acct_...    # widoczne na górze panelu, np. "acct_1Q..."
```

`STRIPE_WEBHOOK_SECRET` damy później (po deployu backendu na VPS, kiedy stworzymy webhook endpoint).

---

## Częste pułapki dla Sp. z o.o. w Stripe

1. **Stripe odrzuca aplikację bo "Business name doesn't match"** — wpisz dokładnie jak w KRS, np. **"Nono Food sp. z o.o."** vs "Nono Food Sp z o.o" (różne!). Konkretny zapis sprawdź w odpisie KRS.

2. **"We need a copy of your articles of incorporation"** — Stripe czasem prosi o **akt założycielski / umowę spółki** lub **odpis aktualny z KRS**. Pobierz z **ekrs.ms.gov.pl** (PDF z podpisem elektronicznym).

3. **2FA przez SMS nie działa do polskich numerów** — wybierz **Authy** lub **Google Authenticator** aplikację.

4. **BLIK pokazuje się jako "Not available" po włączeniu** — czasem trzeba poczekać 24h na aktywację po stronie Stripe. Jeśli >24h — pisz do Stripe support, oni włączą.

5. **Test mode webhook nie odpala się** — sprawdź czy używasz `whsec_test_...` (test mode) dla test keys, NIE `whsec_live_...`.

6. **"Source of funds" pytanie** — odpowiedz: "Revenue from catering services provided to customers"

---

## Co JA robię równolegle (kod, gotowy gdy dasz klucze)

Podczas gdy klikasz przez Stripe ja:

1. Kończę **Stripe webhook handler** w backendzie — sprawdzanie signature, idempotency, retry logic dla 5xx
2. Dodaję **Stripe payment method** preferences dla BLIK + cards + wallets w `medusa-config.ts`
3. Przygotowuję **Apple Pay domain verification** route w storefront (gdy włączysz Apple Pay, wrzucę plik weryfikacyjny pod `/.well-known/...`)
4. Piszę **test E2E** — fake order → BLIK payment (Stripe test mode) → webhook → order completed

Wszystko będzie gotowe zanim dostanę od Ciebie klucze.

---

## Sequence — co po czym

```
Ty (teraz, 45-60 min):
  Część A → B → C → E
  (Część D zostawiamy na po deployu)
  ↓
  Wysyłasz mi pk_test_, sk_test_, acct_
  ↓
Ja (po Twoim sygnale, ~30 min):
  Wklejam klucze do .env staging
  Uruchamiam test mode end-to-end
  Symulujemy BLIK payment (Stripe ma test BLIK codes: "123456")
  ↓
Stripe weryfikacja (1-3 dni robocze):
  Dostajesz email "Account activated"
  ↓
Switch test → live:
  Wymieniasz pk_test_ na pk_live_, sk_test_ na sk_live_
  Pierwszy prawdziwy płatność BLIK od klienta
  ↓
Po deployu backendu na VPS (Część D):
  Tworzymy webhook endpoint w panelu Stripe
  Wklejasz whsec_ do .env
  Restart backend
  ↓
🎉 Live i działa
```

---

## Cennik Stripe Polska (dla porównania)

| Metoda | Prowizja Stripe |
|---|---|
| Karta polska | 1.4% + 0.25 PLN |
| Karta z UE | 1.4% + 0.25 PLN |
| Karta non-EU | 2.9% + 0.25 PLN |
| BLIK | 1.4% + 0.25 PLN |
| Apple/Google Pay | jak karta którą używają |
| Przelewy24 | 0.8% + 0.40 PLN |
| Wypłata na PL konto | 0 PLN |
| Subscription (recurring) | +0.5% |

**Przykład:** zamówienie 300 PLN przez BLIK → opłata Stripe ~4.45 PLN → Ty dostajesz ~295.55 PLN.

---

## Daj mi znać kiedy:

- ✅ Skończyłeś Część B (Submit application)
- ✅ Masz `pk_test_` i `sk_test_`
- ✅ Włączyłeś BLIK + Apple Pay + Google Pay
- ❌ Utknąłeś na jakimkolwiek kroku — opisz problem, pomogę

Powodzenia. Część B-E powinna zająć ~45 min jeśli masz dokumenty pod ręką.

---

*STRIPE_SETUP.md · Catering Śląski platform · 20 maja 2026*
