/**
 * JSON-LD schema factories for SEO + rich snippets.
 *
 * Why factories instead of static JSON: env-driven (BASE_URL changes between
 * preview/prod), and product/breadcrumb schemas need runtime data.
 *
 * Output is a plain object — caller stringifies with JSON.stringify and
 * embeds via <script type="application/ld+json">.
 */
const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://cateringslaski.pl"
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Catering Śląski"

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": SITE_URL + "#org",
    name: SITE_NAME,
    url: SITE_URL,
    telephone: "+48793001900",
    email: "zamowienia@cateringslaski.pl",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Marcina Kasprzaka 256",
      addressLocality: "Dąbrowa Górnicza",
      postalCode: "41-303",
      addressCountry: "PL",
      addressRegion: "Śląskie",
    },
    geo: { "@type": "GeoCoordinates", latitude: 50.3214, longitude: 19.1857 },
    priceRange: "$$",
    servesCuisine: ["Polish", "Silesian"],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "08:00",
        closes: "17:00",
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "187",
    },
    sameAs: [
      "https://www.facebook.com/cateringslaski",
      "https://www.instagram.com/cateringslaski",
    ],
    areaServed: [
      { "@type": "City", name: "Katowice" },
      { "@type": "City", name: "Gliwice" },
      { "@type": "City", name: "Sosnowiec" },
      { "@type": "City", name: "Dąbrowa Górnicza" },
      { "@type": "City", name: "Zabrze" },
      { "@type": "City", name: "Bytom" },
      { "@type": "City", name: "Chorzów" },
      { "@type": "City", name: "Tychy" },
    ],
  }
}

export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": SITE_URL + "#website",
    url: SITE_URL,
    name: SITE_NAME,
    inLanguage: "pl-PL",
    publisher: { "@id": SITE_URL + "#org" },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: SITE_URL + "/menu?q={search_term_string}" },
      "query-input": "required name=search_term_string",
    },
  }
}

export type ProductForSchema = {
  id: string
  handle: string
  title: string
  description?: string
  thumbnail?: string | null
  price_cents?: number
  currency?: string
  rating_avg?: number
  rating_count?: number
  is_vegetarian?: boolean
  is_gluten_free?: boolean
}

export function buildProductJsonLd(p: ProductForSchema) {
  const url = SITE_URL + "/produkt/" + p.handle
  const price = ((p.price_cents ?? 0) / 100).toFixed(2)
  const currency = (p.currency ?? "PLN").toUpperCase()
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": url + "#product",
    name: p.title,
    description: p.description ?? `${p.title} — domowy smak Śląska. Catering Śląski.`,
    image: p.thumbnail ? [p.thumbnail] : [SITE_URL + "/og-default.jpg"],
    sku: p.id,
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: currency,
      price,
      availability: "https://schema.org/InStock",
      seller: { "@id": SITE_URL + "#org" },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: "0", currency },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "PL" },
      },
    },
    ...(p.rating_avg && p.rating_count
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: p.rating_avg.toFixed(1),
            reviewCount: p.rating_count,
          },
        }
      : {}),
    additionalProperty: [
      ...(p.is_vegetarian ? [{ "@type": "PropertyValue", name: "Wegetariańskie", value: "tak" }] : []),
      ...(p.is_gluten_free ? [{ "@type": "PropertyValue", name: "Bez glutenu", value: "tak" }] : []),
    ],
  }
}

export type BreadcrumbItem = { name: string; url: string }
export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((i, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: i.name,
      item: i.url.startsWith("http") ? i.url : SITE_URL + i.url,
    })),
  }
}

export type FaqItem = { question: string; answer: string }
export function buildFaqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.question,
      acceptedAnswer: { "@type": "Answer", text: i.answer },
    })),
  }
}

export function buildItemListJsonLd(items: Array<{ name: string; url: string; image?: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((i, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: i.name,
      url: i.url.startsWith("http") ? i.url : SITE_URL + i.url,
      ...(i.image ? { image: i.image } : {}),
    })),
  }
}
