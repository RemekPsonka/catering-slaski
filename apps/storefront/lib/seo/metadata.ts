/**
 * Per-page metadata builder with optional override from backend SEO module.
 *
 * Flow:
 *   1. Try GET /store/seo?path=/produkt/zurek → backend returns override if admin set it
 *   2. Fall back to caller-provided defaults (computed from product etc.)
 *   3. Always emit canonical, og, twitter
 */
import type { Metadata } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://cateringslaski.pl"
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Catering Śląski"
const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || ""
const PUB_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

export type SeoOverride = {
  title?: string
  description?: string
  og_title?: string
  og_description?: string
  og_image?: string
  twitter_title?: string
  twitter_description?: string
  twitter_image?: string
  canonical?: string
  robots?: string // e.g. "index,follow" | "noindex,nofollow"
  keywords?: string[]
}

/** Fetch admin-managed SEO override for a path. Best-effort: never throws. */
export async function fetchSeoOverride(path: string): Promise<SeoOverride | null> {
  if (!BACKEND_URL) return null
  try {
    const url = new URL(BACKEND_URL + "/store/seo")
    url.searchParams.set("path", path)
    const res = await fetch(url.toString(), {
      headers: PUB_KEY ? { "x-publishable-api-key": PUB_KEY } : {},
      next: { revalidate: 60, tags: ["seo:" + path] },
      signal: AbortSignal.timeout(2500),
    })
    if (!res.ok) return null
    const data = await res.json()
    return (data?.seo as SeoOverride) ?? null
  } catch {
    return null
  }
}

export type SeoBuildInput = {
  path: string
  defaults: {
    title: string
    description: string
    image?: string
    canonical?: string
    keywords?: string[]
    noindex?: boolean
  }
}

/**
 * Build a Next.js Metadata object from defaults + optional admin override.
 * Use in `generateMetadata()` for any page that wants admin-editable SEO.
 */
export async function buildMetadata({ path, defaults }: SeoBuildInput): Promise<Metadata> {
  const override = await fetchSeoOverride(path)
  const title = override?.title ?? defaults.title
  const description = override?.description ?? defaults.description
  const canonical = override?.canonical ?? defaults.canonical ?? path
  const image = override?.og_image ?? defaults.image ?? "/og-default.jpg"
  const robots = override?.robots
    ? parseRobots(override.robots)
    : defaults.noindex
    ? { index: false, follow: false }
    : { index: true, follow: true }

  return {
    title,
    description,
    keywords: override?.keywords ?? defaults.keywords,
    alternates: { canonical },
    openGraph: {
      title: override?.og_title ?? title,
      description: override?.og_description ?? description,
      url: canonical.startsWith("http") ? canonical : SITE_URL + canonical,
      siteName: SITE_NAME,
      locale: "pl_PL",
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: override?.twitter_title ?? title,
      description: override?.twitter_description ?? description,
      images: [override?.twitter_image ?? image],
    },
    robots: { ...robots, googleBot: robots },
  }
}

function parseRobots(value: string): { index: boolean; follow: boolean } {
  const tokens = value.toLowerCase().split(/[,\s]+/)
  return {
    index: !tokens.includes("noindex"),
    follow: !tokens.includes("nofollow"),
  }
}
