/**
 * Analytics facade — single import surface for the storefront.
 *
 * Usage in client components:
 *   import { track, identify, useTrackPageView } from "@/lib/analytics"
 *   track({ event: "add_to_cart", currency: "PLN", value: 4500, items: [...] })
 *
 * Usage in RSC: not supported (dataLayer is window-bound). Pass data down,
 * track from client wrapper.
 *
 * All writes go through dataLayer.push so GTM owns vendor fan-out.
 */
"use client"

import type { AnalyticsEvent, ConsentState } from "./events"

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

function ensureDataLayer(): unknown[] {
  if (typeof window === "undefined") return []
  window.dataLayer = window.dataLayer || []
  return window.dataLayer
}

/**
 * Push an ecommerce event to GTM dataLayer. The `ecommerce: null` reset
 * before the actual event is GA4 best practice — it clears state so the
 * next event doesn't carry stale items.
 */
export function track(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return
  const dl = ensureDataLayer()
  // GA4 ecommerce events need ecommerce wrapper; non-ecommerce stay flat.
  const ecommerceEvents = new Set([
    "view_item",
    "view_item_list",
    "add_to_cart",
    "remove_from_cart",
    "view_cart",
    "begin_checkout",
    "add_shipping_info",
    "add_payment_info",
    "purchase",
    "select_item",
    "refund",
  ])
  const { event: name, ...rest } = event as { event: string; [k: string]: unknown }
  if (ecommerceEvents.has(name)) {
    dl.push({ ecommerce: null })
    dl.push({ event: name, ecommerce: rest })
  } else {
    dl.push({ event: name, ...rest })
  }
}

/**
 * Identify a logged-in user. Sets `user_id` on dataLayer + gtag.
 * Email/phone NEVER sent in plaintext — pass already-hashed (SHA-256)
 * if you want enhanced conversions / advanced matching.
 */
export function identify(userId: string, traits?: { email_sha256?: string; phone_sha256?: string }): void {
  if (typeof window === "undefined") return
  const dl = ensureDataLayer()
  dl.push({
    event: "user_identified",
    user_id: userId,
    user_data: traits ?? undefined,
  })
}

/**
 * Logout — clear user identifiers.
 */
export function resetIdentity(): void {
  if (typeof window === "undefined") return
  const dl = ensureDataLayer()
  dl.push({ event: "user_reset", user_id: null, user_data: null })
}

/**
 * Update consent. Triggers Google Consent Mode v2 update and Meta Pixel
 * fbq('consent', 'grant'|'revoke'). GTM container should listen to
 * dataLayer event "consent_update" and apply gtag('consent', 'update', {...}).
 */
export function updateConsent(state: ConsentState): void {
  if (typeof window === "undefined") return
  const dl = ensureDataLayer()
  // Google Consent Mode v2 mapping
  const gcm = {
    ad_storage: state.ad ? "granted" : "denied",
    ad_user_data: state.ad_user_data ? "granted" : "denied",
    ad_personalization: state.ad_personalization ? "granted" : "denied",
    analytics_storage: state.analytics ? "granted" : "denied",
    functionality_storage: state.functionality ? "granted" : "denied",
    personalization_storage: state.personalization ? "granted" : "denied",
    security_storage: state.security ? "granted" : "denied",
  }
  dl.push({ event: "consent_update", consent: gcm, consent_state: state })
  // Meta Pixel grant/revoke (fbq present iff GTM container loaded Meta tag)
  if (typeof (window as any).fbq === "function") {
    ;(window as any).fbq("consent", state.ad ? "grant" : "revoke")
  }
}

/**
 * One-line page_view helper for use in client wrappers / route changes.
 */
export function trackPageView(path: string, title?: string): void {
  track({ event: "page_view", page_path: path, page_title: title ?? document.title })
}

export * from "./events"
