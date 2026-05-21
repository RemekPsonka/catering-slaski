import type { Metadata } from "next"
import "./globals.css"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { GtmScript, GtmNoscript } from "@/components/analytics/GtmScript"
import { ConsentBanner } from "@/components/analytics/ConsentBanner"
import { PageViewTracker } from "@/components/analytics/PageViewTracker"
import { Suspense } from "react"
import { buildOrganizationJsonLd, buildWebsiteJsonLd } from "@/lib/seo/schemas"

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://cateringslaski.pl"

export const metadata: Metadata = {
  title: {
    default: "Catering Śląski — Gotujemy mocno. Jak Śląsk.",
    template: "%s · Catering Śląski",
  },
  description:
    "Catering eventowy i lunch firmowy na Górnym Śląsku. Zamów do 16:00 — dostarczymy jutro. AI Generator menu w 15 sekund.",
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    url: SITE_URL,
    siteName: "Catering Śląski",
    title: "Catering Śląski — Gotujemy mocno. Jak Śląsk.",
    description:
      "Catering eventowy i lunch firmowy z domowych receptur babci Hildy. Zamówisz w 3 minuty.",
    images: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: "Catering Śląski" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Catering Śląski",
    description: "Catering eventowy i lunch firmowy na Górnym Śląsku",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : undefined,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pl">
      <head>
        <GtmScript />
        {/* JSON-LD: Organization + WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildOrganizationJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildWebsiteJsonLd()) }}
        />
      </head>
      <body>
        <GtmNoscript />
        <Suspense fallback={null}>
          <PageViewTracker />
        </Suspense>
        <Header />
        <main>{children}</main>
        <Footer />
        <ConsentBanner />
      </body>
    </html>
  )
}
