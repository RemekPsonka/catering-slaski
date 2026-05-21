/**
 * GTM bootstrap + Google Consent Mode v2 default state.
 *
 * Loaded before any other script via `beforeInteractive` so:
 *   1. dataLayer exists for early calls (e.g. in <head>)
 *   2. consent defaults are set BEFORE GA4/Ads tags fire — required by GCM v2
 *   3. GTM container is fetched async
 *
 * Render only when NEXT_PUBLIC_GTM_ID is set.
 *
 * Note: this is a server component (no "use client") — Next.js `Script`
 * handles client-side execution itself. Keeps the layout server-rendered.
 */
import Script from "next/script"

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID

export function GtmScript() {
  if (!GTM_ID) return null
  return (
    <>
      {/* Step 1: consent defaults BEFORE GTM loads (Google Consent Mode v2) */}
      <Script
        id="gcm-default"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('consent', 'default', {
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
              analytics_storage: 'denied',
              functionality_storage: 'granted',
              personalization_storage: 'denied',
              security_storage: 'granted',
              wait_for_update: 500
            });
            gtag('set', 'ads_data_redaction', true);
            gtag('set', 'url_passthrough', true);
          `,
        }}
      />
      {/* Step 2: GTM loader */}
      <Script
        id="gtm-loader"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`,
        }}
      />
    </>
  )
}

export function GtmNoscript() {
  if (!GTM_ID) return null
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        title="GTM"
      />
    </noscript>
  )
}
