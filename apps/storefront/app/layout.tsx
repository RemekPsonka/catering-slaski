import type { Metadata } from "next"
import "./globals.css"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"

export const metadata: Metadata = {
  title: {
    default: "Catering Śląski — Gotujemy mocno. Jak Śląsk.",
    template: "%s · Catering Śląski",
  },
  description:
    "Catering eventowy i lunch firmowy na Górnym Śląsku. Zamów do 16:00 — dostarczymy jutro. AI Generator menu w 15 sekund.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://cateringslaski.pl"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    url: "https://cateringslaski.pl",
    siteName: "Catering Śląski",
    title: "Catering Śląski — Gotujemy mocno. Jak Śląsk.",
    description:
      "Catering eventowy i lunch firmowy z domowych receptur babci Hildy. Zamówisz w 3 minuty.",
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Catering Śląski",
      },
    ],
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pl">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />

        {/* JSON-LD: Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "@id": "https://cateringslaski.pl",
              name: "Catering Śląski",
              url: "https://cateringslaski.pl",
              telephone: "+48793001900",
              email: "zamowienia@cateringslaski.pl",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Marcina Kasprzaka 256",
                addressLocality: "Dąbrowa Górnicza",
                postalCode: "41-303",
                addressCountry: "PL",
              },
              priceRange: "$$",
              servesCuisine: "Polish, Silesian",
              openingHours: "Mo-Su 08:00-17:00",
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.9",
                reviewCount: "187",
              },
            }),
          }}
        />
      </body>
    </html>
  )
}
