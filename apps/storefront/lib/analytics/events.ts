/**
 * Analytics event vocabulary — Shopify Web Pixels + GA4 ecommerce hybrid.
 *
 * Each event ships to GTM dataLayer once, then GTM container fans out to:
 *   - GA4 (gtag config tag)
 *   - Meta Pixel (StandardEvent via Meta template)
 *   - LinkedIn Insight Tag (Conversion via LinkedIn template)
 *   - TikTok Pixel (optional)
 *   - Hotjar / Clarity (page_view + custom events)
 *
 * Naming: GA4 names (snake_case) as primary; Shopify Web-Pixels equivalents
 * are noted in comments so marketers can map 1:1.
 *
 * IMPORTANT: do not push PII directly. Hash emails on the server before
 * setting user_data. userID is the Medusa customer.id (uuid) — safe.
 */

export type Money = { amount: number; currency: string }

export type Item = {
  item_id: string
  item_name: string
  item_category?: string
  item_variant?: string
  item_brand?: string
  price: number
  quantity: number
  // catering-specific:
  portions?: string
  is_vegetarian?: boolean
  is_gluten_free?: boolean
}

export type AnalyticsEvent =
  // page_view — GA4 standard. shopify: page_viewed
  | { event: "page_view"; page_path: string; page_title?: string; page_referrer?: string }
  // view_item — PDP. shopify: product_viewed
  | { event: "view_item"; currency: string; value: number; items: Item[] }
  // view_item_list — listing/menu page. shopify: collection_viewed
  | { event: "view_item_list"; item_list_id?: string; item_list_name?: string; items: Item[] }
  // add_to_cart. shopify: product_added_to_cart
  | { event: "add_to_cart"; currency: string; value: number; items: Item[] }
  // remove_from_cart. shopify: product_removed_from_cart
  | { event: "remove_from_cart"; currency: string; value: number; items: Item[] }
  // view_cart. shopify: cart_viewed
  | { event: "view_cart"; currency: string; value: number; items: Item[] }
  // begin_checkout. shopify: checkout_started
  | { event: "begin_checkout"; currency: string; value: number; items: Item[]; coupon?: string }
  // add_shipping_info. shopify: checkout_shipping_info_submitted
  | { event: "add_shipping_info"; currency: string; value: number; shipping_tier?: string; items: Item[] }
  // add_payment_info. shopify: payment_info_submitted
  | { event: "add_payment_info"; currency: string; value: number; payment_type?: string; items: Item[] }
  // purchase. shopify: checkout_completed
  | {
      event: "purchase"
      transaction_id: string
      currency: string
      value: number
      tax?: number
      shipping?: number
      coupon?: string
      items: Item[]
    }
  // search. shopify: search_submitted
  | { event: "search"; search_term: string; results_count?: number }
  // sign_up. shopify: customer_registered
  | { event: "sign_up"; method?: string }
  // login. shopify: customer_logged_in
  | { event: "login"; method?: string }
  // generate_lead — B2B brief / AI menu generator
  | { event: "generate_lead"; lead_type: "b2b_brief" | "ai_menu" | "newsletter"; value?: number }
  // select_item — click on tile in listing
  | { event: "select_item"; item_list_id?: string; items: Item[] }
  // user engagement extras (phone click, map open, video play)
  | { event: "engagement"; engagement_type: string; metadata?: Record<string, unknown> }
  // custom: zone_checked — user verifies own address
  | { event: "zone_checked"; zone_slug?: string; zone_available: boolean; postal_code?: string }

export type ConsentState = {
  analytics: boolean
  ad: boolean
  ad_personalization: boolean
  ad_user_data: boolean
  functionality: boolean
  personalization: boolean
  security: boolean
}

export const DEFAULT_CONSENT: ConsentState = {
  analytics: false,
  ad: false,
  ad_personalization: false,
  ad_user_data: false,
  functionality: true,
  personalization: false,
  security: true,
}

export const ACCEPTED_CONSENT: ConsentState = {
  analytics: true,
  ad: true,
  ad_personalization: true,
  ad_user_data: true,
  functionality: true,
  personalization: true,
  security: true,
}

export const REJECTED_CONSENT: ConsentState = {
  analytics: false,
  ad: false,
  ad_personalization: false,
  ad_user_data: false,
  functionality: true,
  personalization: false,
  security: true,
}
