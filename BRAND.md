# Catering Śląski — Identyfikacja Wizualna v2

**Data:** 19 maja 2026
**Status:** Aktualne — zastępuje "premium dark + gold" z STRATEGIA.md

> **Pivot kierunkowy:** logo to **mining tower + tory kolejowe + monochromatyczna typografia sans-serif**. Industrialny Śląsk, nie luxury restauracja. Cały design system został dopasowany do tego DNA.

---

## 1. Esencja brandu

**Catering Śląski** to nie premium luxury catering. To **catering z duszą Śląska**: industrialna spuścizna kopalń i hut, ale na talerzu — ciepłe, domowe, mocne jedzenie, jak u babci po szychcie. Marka łączy **hard industrial heritage** z **warm comfort food**.

### Brand essence (one sentence)
> Gotujemy mocno. Jak Śląsk.

### Brand pillars
1. **Heritage** — Górny Śląsk, kopalnie, huty, generacje pracy
2. **Honesty** — żadnego bullshitu, prosto i mocno
3. **Warmth** — pomimo industrialnej skorupy, środek jest ciepły jak rosół
4. **Modern** — dziś-AI, online, technologicznie na poziomie, ale bez przesady

### Tone of voice
- **Direct.** Nie "wykwintne dania kuchni regionalnej" tylko "rolada, kluski, czerwona — jak należy".
- **Krótko.** Śląski człowiek nie owija w bawełnę.
- **Z poczuciem humoru, bez ironii.** Babcia Hilda nie żartuje z jedzenia.
- **Z dumą regionalną**, ale bez folkloru-disneylandu.
- **W pierwszej osobie liczby mnogiej** ("My gotujemy", nie "Firma świadczy usługi cateringowe").

### Czego brand NIGDY nie robi
- Nie używa słów "wykwintny", "rzemieślniczy", "premium", "boutique"
- Nie szpanuje "michelin-inspired" itd.
- Nie pisze copy w sztywnym korpo-języku
- Nie używa złota, srebra, lakierowanego black-luxury
- Nie próbuje wyglądać jak Sweetgreen / Sezane / Aesop

---

## 2. Logo

### Kluczowe elementy

```
   /\           ___________________
  /  \         |  CATERING        |
 |____|        |  ŚLĄSKI _        |
 |    |        |__________________|
 |____|
 ____|____
 -railway-tracks-
```

Logo składa się z:
- **Symbol**: stylizowana wieża szybowa kopalni (gornośląska ikona) + tory kolejowe pod spodem
- **Wordmark**: "CATERING ŚLĄSKI" — sans-serif bold, UPPERCASE, czarne litery, dwie linie
- **Detail**: znak `_` (podkreślnik) po "ŚLĄSKI" — celowy element typograficzny, sygnalizuje "to nie koniec, to platforma"

### Wersje logo

| Wersja | Kiedy używać | Plik |
|---|---|---|
| **Full lockup** (symbol + wordmark) | Strona główna, nagłówki, materiały marketingowe | logo-full.svg |
| **Symbol only** | Favicon, app icon, social avatar | logo-symbol.svg |
| **Wordmark only** | Wąskie miejsca (footer, signature, prasa) | logo-wordmark.svg |
| **Negative** (białe na czarnym) | Dark backgrounds, social media | logo-full-white.svg |

### Reguły użycia

✅ **Tak**
- Czarne logo na białym/jasnym tle
- Białe logo na czarnym/ciemnym tle (jeden kolor, nie kombinacje)
- Min. 32px wysokości symbolu (poniżej traci czytelność)
- Padding wokół = 1× wysokość "C" w wordmark (clear space)

❌ **Nie**
- Nie kolorowane (nigdy "logo w gold", "logo w niebieskim" — TYLKO czarne lub białe)
- Nie rotowane, nie skewed
- Nie outline tylko (zawsze solid)
- Nie na zdjęciach bez overlay (nieczytelne)
- Nie z efektami (cień, glow, gradient)

---

## 3. Paleta kolorów

### Primary — monochromatyczna baza

```
COAL BLACK        #0A0908   ← podstawowy tekst, logo, primary CTA
INK                #1A1717   ← cienie tekstu, dark surfaces
CHARCOAL           #2B2826   ← cards na dark mode
GRAPHITE           #585553   ← drugorzędny tekst
STEEL              #8B8784   ← placeholdery, disabled
SMOKE              #C5C2BE   ← borders, separatory
BONE               #E8E3DA   ← jasne tła, hovers
PAPER              #F5F2EC   ← główne tło ("off-white")
SNOW               #FFFFFF   ← czyste białe surfaces
```

### Accent — jedyny kolor dla aktywnych elementów

```
SIGNAL ORANGE     #E54B17   ← CTA, alerty, hot states, deadline countdown
EMBER             #C73E0F   ← hover/pressed states
WARM ALERT        #FFE6DC   ← jasne tła dla orange context
```

**Signal Orange** to **jedyny accent w systemie**. Pochodzi z industrialnej spuścizny (kolor ostrzegawczy w hutach, kolor żaru pieca martenowskiego, kolor pomarańczowego pasa roboczego). Używany **bardzo oszczędnie** — wyłącznie do:
- Primary CTA ("Zamów teraz")
- Deadline countdown (urgency)
- Status alerts (np. "ostatnie sztuki")
- Active filter/tab indicators
- Brand moments (1-2 razy na stronę max)

### Semantic — funkcjonalne

```
SUCCESS GREEN     #2D5A3D   ← potwierdzenia (mało wykorzystywane, brand jest neutralny)
WARNING AMBER     #C9852E   ← uwagi (rzadko)
ERROR RED         #B0413E   ← błędy formularzy
INFO              #2B2826   ← informacje (= CHARCOAL, neutral)
```

### Co WYCINAMY z poprzedniej wersji

- ❌ **Burnt Gold** (#C9A961) — nie pasuje, premium-restauracja vibe
- ❌ **Deep Forest** (#0B2818) — nie pasuje, organic-luxury vibe
- ❌ **Warm Cream** (#F4EFE6) → zastąpione przez **PAPER** (#F5F2EC, neutralniejsze)
- ❌ **Tomato Red** (#C73E1D) → zastąpione przez **SIGNAL ORANGE** (#E54B17, bardziej industrial)

### Kontrast i dostępność

- Coal Black na Paper: kontrast 18.1:1 ✅ (WCAG AAA)
- Signal Orange na Paper: kontrast 4.6:1 ✅ (WCAG AA Large)
- **Signal Orange NIE jest używany dla body text** — tylko CTA, ikon i akcentów

---

## 4. Typografia

### Familia podstawowa: **Inter Tight** + **Inter**

| Rola | Font | Waga | Wielkość | Tracking | Case |
|---|---|---|---|---|---|
| **Display XL** (hero) | Inter Tight | 700 (Bold) | 64-96px | -0.03em | UPPERCASE |
| **Display L** (section heads) | Inter Tight | 700 | 48-64px | -0.02em | UPPERCASE |
| **Display M** | Inter Tight | 600 (SemiBold) | 32-40px | -0.01em | UPPERCASE |
| **Heading L** | Inter Tight | 600 | 24-28px | -0.01em | Mixed case |
| **Heading M** | Inter Tight | 600 | 18-20px | normal | Mixed case |
| **Body L** | Inter | 400 | 18px | normal | Mixed case |
| **Body M** | Inter | 400 | 15-16px | normal | Mixed case |
| **Body S** | Inter | 400 | 13-14px | normal | Mixed case |
| **Caption / labels** | Inter | 500 (Medium) | 11-12px | 0.1em | UPPERCASE |
| **Quote / poetic** | Caveat lub Inter italic | — | 24-32px | normal | Mixed case |

### Klucz designerski: **UPPERCASE Inter Tight dla brand moments**

Logo używa uppercase sans-serif. Wszystkie hero headlines naśladują ten gest — **mocne, krótkie, w blokach**, jak napisy na ścianie zakładu.

**Przykład hero:**
```
GOTUJEMY MOCNO.
JAK ŚLĄSK.
```
nie:
```
Wyjątkowy smak na każdą okazję
```

### Mieszanie z normal-case

Long-form content (paragrafy, body, FAQ) → Inter w mixed case dla czytelności. UPPERCASE TYLKO dla:
- Hero headlines
- Section headings (krótkie, max 6 słów)
- Buttons / CTA
- Labels (kategorie, statusy, tagi)
- Logo

### Cudzysłowy i interpunkcja

- Polskie cudzysłowy: „cytat" — nie "" ani ""
- Półpauza/myślnik: – (en dash) lub — (em dash), nie -
- Wielokropek: … (jeden znak), nie ...

---

## 5. Grid i spacing

### Spacing scale (8px base)

```
xs    4px
sm    8px
md    16px
lg    24px
xl    32px
2xl   48px
3xl   64px
4xl   96px
5xl   128px
```

### Container

- Max width: **1280px** (`max-w-7xl`)
- Padding boczny: 24px mobile / 40px desktop
- Sekcje pionowe: **128px** desktop / 80px mobile

### Grid system

- 12 column grid na desktop
- 4 column grid na mobile
- Gutter: 24px desktop / 16px mobile

---

## 6. Komponenty UI — design tokens

### Buttons

```css
/* Primary — Coal Black solid */
.btn-primary {
  background: #0A0908;
  color: #F5F2EC;
  padding: 14px 28px;
  font: 500 14px/1 'Inter Tight', sans-serif;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border: none;
  /* NO rounded corners — square (industrial) */
  border-radius: 0;
}
.btn-primary:hover { background: #1A1717; }

/* Accent — Signal Orange (RZADKO) */
.btn-accent {
  background: #E54B17;
  color: #FFFFFF;
  /* reszta identyczna */
}
.btn-accent:hover { background: #C73E0F; }

/* Ghost — outline */
.btn-ghost {
  background: transparent;
  color: #0A0908;
  border: 1.5px solid #0A0908;
  /* reszta identyczna */
}
.btn-ghost:hover { background: #0A0908; color: #F5F2EC; }
```

**KLUCZOWA DECYZJA**: buttons są **square** (border-radius: 0 lub max 2px). Nie pillowane jak w premium-luxury. Industrial = ostre krawędzie.

### Cards

```css
.card {
  background: #FFFFFF;
  border: 1px solid #E8E3DA;
  border-radius: 4px; /* minimal radius */
  padding: 24px;
}

.card-dark {
  background: #1A1717;
  color: #F5F2EC;
  border: 1px solid #2B2826;
}
```

### Borders

- **Cienkie** — 1px lub 1.5px (nigdy 2px+, nie chcemy "bubble" feel)
- **Sharp corners** — radius 0-4px max
- Cienie minimalne — `0 1px 3px rgba(0,0,0,0.06)` max

### Ikony

- **Lucide icons** lub własne SVG line-art
- Stroke width: **1.5-2px** (zgodne ze stylem logo line-art)
- Bez wypełnień — wyłącznie outline
- 18-24px standardowo

---

## 7. Fotografia

### Styl food photography

- **Top-down** lub **3/4 angle** — nigdy "instagrammable" płaskie kompozycje
- **Naturalne światło** — nie studyjne softboxy
- **Ciemne, ziemiste tła** — drewno, surowy beton, czarne łupkowe deski (echo śląskie)
- **Bez bullshitu** — talerz, jedzenie, koniec. Nie kwiatki, nie ozdoby, nie świece.
- **Kontrast** — wyraźny, fotografia jak z Magnum kontrastowa, nie "soft fashion"
- **Kolory żywieniowe naturalne** — nie crank saturation, nie filtry

### Co NIE robić
- Stockowych zdjęć z Unsplash z czerwonymi kelnerkami
- Bokeh tła z lampkami
- "Instagram aesthetic" — minty greens, pastel pinks
- Wszystko nie-jedzenie (modele, ręce, wino w kieliszkach)

### Sesja zdjęciowa — brief dla fotografa

50 BOXów top + 20 sytuacyjnych (kuchnia, kucharze przy pracy, sesja "po szychcie z BOXem na stole"):
- Mood: "industrial heritage + warm food"
- Reference: Magnum Photos kulinarne, NYT Cooking, czarno-białe portrety przemysłowe Beuysa
- NIE: Pinterest food bloggers, Sezane look
- Format: 4:5 portrait dla mobile + 16:9 landscape dla hero + 1:1 square dla katalogu

---

## 8. Tone of voice — przykłady copy

### Hero

❌ Stare (premium-gold direction):
> "Wyjątkowy smak na każdą okazję. Celebruj ważne chwile, nie stojąc w kuchni."

✅ Nowe (industrial-honest):
> "GOTUJEMY MOCNO. JAK ŚLĄSK.
> Catering, który Ci nie zawiedzie. Bo wiemy, jak Ci zależy."

### Sekcja "O nas"

❌ Stare:
> "Nasze menu łączy tradycyjne śląskie potrawy z nowoczesnymi akcentami kulinarnymi."

✅ Nowe:
> "Gotujemy z tych samych receptur, z których nasze babcie gotowały po szychcie.
> Tylko że dziś można nas zamówić jednym klikiem."

### CTA

❌ Stare: "Sprawdź naszą ofertę"
✅ Nowe: **"ZAMÓW"** lub **"POKAŻ MENU"** (krótko, mocno)

❌ Stare: "Zarezerwuj termin"
✅ Nowe: **"WYBIERAM TĘ DATĘ"** lub **"ZAJMIJ TERMIN"**

### FAQ

❌ Stare:
> "Z jakim wyprzedzeniem należy złożyć zamówienie?"

✅ Nowe:
> "Kiedy najpóźniej mogę zamówić?"
> "Dziś do 16:00 — jutro przywieziemy. Strefa krajowa: 2 dni wcześniej."

### Strona błędu (404)

✅ Nowe:
> "TUTAJ NIC NIE MA.
> Może wieża szybowa się zawaliła. Wracaj do menu →"

---

## 9. Co zmieniamy w istniejących plikach

| Plik | Status | Co zmienić |
|---|---|---|
| `01-landing.html` | **Przebudowany** w tym sprincie | Pełen rewrite — kolory, typografia, copy |
| `02-konfigurator-b2b.html` | **Wymaga update** | Kolory + buttons sharp + typo Inter Tight |
| `03-sklep-b2c.html` | **Wymaga update** | Kolory + buttons sharp + typo Inter Tight |
| `04-checkout.html` | **Wymaga update** | Kolory + buttons sharp + typo Inter Tight |
| `05-konto.html` | **Wymaga update** | Kolory + buttons sharp + typo Inter Tight |
| `index.html` | **Update** | Reflect new brand direction |
| `STRATEGIA.md` | Status: archiwalne | Sekcja "Design Direction" out-of-date |
| `docs/CATERING_SHOP_SPEC_V3.md` | Aktualne | Niezmienione (technical spec, nie brand) |

### Plan migracji innych mockupów

Cztery pozostałe mockupy (02-05) zachowują strukturę i funkcjonalność, **tylko refresh skóry**:

1. Find/replace kolorów:
   - `#0B2818` (forest dark) → `#0A0908` (coal black)
   - `#061812` (forest deepest) → `#1A1717` (ink)
   - `#C9A961` (gold) → `#E54B17` (signal orange) lub `#0A0908` (coal) dla akcentów neutralnych
   - `#D9BC78` (gold light) → usunąć / zastąpić `#FFFFFF` (snow)
   - `#F4EFE6` (cream) → `#F5F2EC` (paper)

2. Typography swap:
   - `Fraunces` (serif) → `Inter Tight` (sans, uppercase dla headers)
   - `Instrument Serif` (italic accent) → usuń, brand jest direct

3. Buttons:
   - `rounded-full` → `rounded-none` lub `rounded-sm`
   - `bg-gold-*` → `bg-coal-900` (primary) lub `bg-orange-500` (accent)

4. Copy:
   - "Wyjątkowy smak na każdą okazję" → "GOTUJEMY MOCNO. JAK ŚLĄSK."
   - "Catering, którego nie zapomnisz" → "Catering, który Ci nie zawiedzie."
   - "Smak, który pamiętasz" → "Smak, który znasz."

---

## 10. Inspiracje wizualne

### W kierunku którego idziemy
- **Carhartt WIP** — industrial heritage, premium quality, working-class proud
- **Aēsop** (wczesne kolekcje) — minimalist, monochrome, intentional
- **Magnum Photos** — kontrastowa, surowa fotografia kulinarna
- **Brutalist architecture editorials** — strong type, sharp corners
- **Tabasco** — old industrial label aesthetic
- **Wieliczka / Guido** (kopalnie jako muzea) — industrial heritage reframed dla XXI w.

### Od czego się odsuwamy
- ~~Sweetgreen~~ — zbyt "fresh california"
- ~~Sezane~~ — zbyt "parisian luxury"
- ~~Sweetgreen-likes~~ — zbyt gen-Z friendly
- ~~Hello Fresh~~ — zbyt mainstream marketing

### One-liner brand pitch

> Catering Śląski to **Carhartt na talerzu**: industrial-rooted, no-bullshit, mocne jedzenie z online platformy XXI wieku. Robimy jak w zakładzie. Smakuje jak u babci.

---

*Brand identity v2 — dopasowane do logo. 19 maja 2026.*
