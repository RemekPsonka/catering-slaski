# Catering Śląski — Integration Guide (Analytics, Emails, SEO, Admin)

Stan po PR `feat/analytics-emails-seo-admin`.

## 1. Analytics (GTM + GA4 + Meta + LinkedIn)

**Co już jest w kodzie:**
- `lib/analytics/index.ts` — fasada: `track()`, `identify()`, `updateConsent()`, `trackPageView()`
- `lib/analytics/events.ts` — typowane eventy (GA4 nazewnictwo + Shopify Pixels mapping)
- `lib/analytics/mappers.ts` — `productToItem()`, `cartLineToItem()`
- `components/analytics/GtmScript.tsx` — bootstrap z **Google Consent Mode v2 default = denied**
- `components/analytics/ConsentBanner.tsx` — RODO banner (Accept / Reject / Customize)
- `components/analytics/PageViewTracker.tsx` — `page_view` na każdej zmianie route
- Eventy `view_item` (PDP) i `add_to_cart` (AddToCart) — zainstrumentowane.

**Co musi zrobić marketer:**

1. Wejdź na https://tagmanager.google.com → nowy kontener (Web) dla `cateringslaski.pl`. Skopiuj ID `GTM-XXXXXXX`.
2. Ustaw na Vercel:
   ```bash
   vercel env add NEXT_PUBLIC_GTM_ID production
   ```
3. W kontenerze GTM dodaj zmienne **Data Layer Variable**:
   - `ecommerce.value`, `ecommerce.currency`, `ecommerce.items`, `ecommerce.transaction_id`, `user_id`, `consent_state`, `consent`
4. Dodaj **tagi**:
   - **GA4 Configuration** (Measurement ID `G-XXXXXXX`) → trigger: `All Pages`. Pole „User ID" → `{{user_id}}`.
   - **GA4 Event** (jeden tag per event: `add_to_cart`, `view_item`, `begin_checkout`, `purchase` itd.) → trigger: Custom Event matching nazwa, params z DL variables.
   - **Meta Pixel** (jeden tag, Standard Event mapping: `AddToCart`, `ViewContent`, `InitiateCheckout`, `Purchase`) → trigger: te same custom events.
   - **LinkedIn Insight Tag** → trigger: `All Pages`.
5. Skonfiguruj **Consent Settings** każdego tagu Google/Ads:
   - Built-in: wymagaj `analytics_storage` / `ad_storage` zgodnie z polityką.
6. Publikuj kontener → eventy zaczną lecieć.

**Co dorzucić w kolejnych PR-ach (już zaplanowane miejsca w kodzie):**
- `begin_checkout` na otwarciu `CheckoutFlow`
- `add_shipping_info` / `add_payment_info` na krokach checkoutu
- `purchase` na thank-you page (z `transaction_id` = order.display_id)
- `identify(customer.id)` po logowaniu

## 2. Maile (Resend)

**Provider:** `apps/backend/src/modules/resend-notification/` — własny adapter do oficjalnej Notification module Medusa 2.9.

**Templates (`src/emails/templates.ts`):**
- `renderOrderConfirmation` — order.placed ✅ (był wcześniej)
- `renderPaymentCaptured` — payment.captured ✅
- `renderOrderShipped` — fulfillment.shipment_created ✅
- `renderOrderDelivered` — fulfillment.delivery_created ✅
- `renderAbandonedCart` — cron 17:00 codziennie ✅
- `renderB2BLeadReceived` — b2b-lead.created ✅
- `renderWelcomeCustomer` — customer.created ✅
- `renderDeliveryEta`, `renderB2BQuoteFollowUp` (były już wcześniej)

**Co musi zrobić ops:**

1. Załóż konto Resend, weź API key.
2. Na Railway:
   ```bash
   railway variables set RESEND_API_KEY=re_...
   railway variables set RESEND_FROM=onboarding@resend.dev   # do czasu DNS
   railway variables set RESEND_REPLY_TO=zamowienia@cateringslaski.pl
   ```
3. Po skonfigurowaniu DNS dla cateringslaski.pl (SPF/DKIM/DMARC z panelu Resend):
   ```bash
   railway variables set RESEND_FROM=zamowienia@cateringslaski.pl
   ```

## 3. SEO

**Storefront:**
- `app/sitemap.ts` — statyczne strony + produkty z Medusa
- `app/robots.ts` — disallow /api/, /checkout, /koszyk, /konto, /zamowienie/, allow LLM bots
- `app/layout.tsx` — Organization + WebSite JSON-LD
- `app/produkt/[slug]/page.tsx` — Product + BreadcrumbList JSON-LD, dynamic metadata
- `app/menu, /konfigurator, /lunch, /dla-firm, /dostawa, /o-nas` — generateMetadata z buildMetadata()
- `lib/seo/metadata.ts` — `buildMetadata()` z fallbackiem na admin override
- `lib/seo/schemas.ts` — factory dla wszystkich schemas

**Backend admin-editable SEO:**
- Moduł `seo-meta` (`apps/backend/src/modules/seo-meta/`)
- API: `GET /store/seo?path=...`, `GET/POST /admin/seo-meta`, `GET/POST/DELETE /admin/seo-meta/:id`
- Admin UI: `/app/seo-meta`

**Po pierwszym deploy:**
1. W Search Console / Bing Webmaster zweryfikuj domenę → ustaw `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`.
2. Zgłoś `https://cateringslaski.pl/sitemap.xml`.

## 4. Admin extensions

W menu `/app` pojawią się:
- **Strefy dostawy** (`/app/delivery-zones`)
- **Sloty dostaw** (`/app/time-slots`)
- **Subskrypcje** (`/app/subscriptions`) — z buttonem „Uruchom generator zamówień"
- **Lojalność** (`/app/loyalty`)
- **SEO meta** (`/app/seo-meta`)
- **AI Generator** (`/app/ai-generator`)

Plus widgety:
- Atrybuty cateringowe — na karcie produktu
- Lojalność klienta — na karcie klienta

## 5. Import produktów Supabase → Medusa

```bash
cd apps/backend
pnpm exec medusa exec ./src/scripts/import-from-supabase.ts
```

Idempotentne: pomija produkty, których `handle` już istnieje.
