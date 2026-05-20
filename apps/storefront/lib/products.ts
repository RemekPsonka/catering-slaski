/**
 * Server-side product fetchers — used by RSC pages.
 * Wraps Medusa REST + catering custom endpoints.
 *
 * Strategy: prefer cache (Next.js fetch revalidate) for catalog, no-store for cart.
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUB_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

function headers() {
  return {
    "Content-Type": "application/json",
    ...(PUB_KEY ? { "x-publishable-api-key": PUB_KEY } : {}),
  }
}

export type Product = {
  id: string
  handle: string
  title: string
  description: string
  thumbnail: string | null
  images: string[]
  variants: Array<{
    id: string
    title: string
    prices: Array<{ amount: number; currency_code: string }>
  }>
  metadata?: Record<string, any>
  // Catering-specific attributes (joined from cs.product_attributes)
  attributes?: {
    portions_label?: string
    is_vegetarian?: boolean
    is_vegan?: boolean
    is_gluten_free?: boolean
    is_bestseller?: boolean
    is_new?: boolean
    allergens?: string[]
    contents?: string[]
    occasion_tags?: string[]
    rating_avg?: number
    rating_count?: number
  }
}

export async function listProducts(opts: {
  category?: string
  limit?: number
  offset?: number
  diet?: string[]
  bestseller?: boolean
} = {}): Promise<{ products: Product[]; count: number }> {
  // Wszystkie błędy łapiemy — fallback do PLACEHOLDER zostaje obsłużony w stronie
  try {
    const url = new URL(`${BACKEND_URL}/store/products`)
    url.searchParams.set("limit", String(opts.limit ?? 24))
    url.searchParams.set("offset", String(opts.offset ?? 0))
    if (opts.category) url.searchParams.set("category", opts.category)

    const res = await fetch(url.toString(), {
      headers: headers(),
      next: { revalidate: 60, tags: ["products"] },
      // 5s timeout — nie czekajmy w nieskończoność na padający backend
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return { products: [], count: 0 }
    const data = await res.json()
    return { products: data.products ?? [], count: data.count ?? 0 }
  } catch (err) {
    // Connection refused, timeout, DNS fail, JSON parse fail — wszystko ląduje tu
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[listProducts] fetch failed, falling back: ${(err as Error).message}`)
    }
    return { products: [], count: 0 }
  }
}

export async function getProductByHandle(handle: string): Promise<Product | null> {
  try {
    const url = new URL(`${BACKEND_URL}/store/products`)
    url.searchParams.set("handle", handle)
    url.searchParams.set("limit", "1")

    const res = await fetch(url.toString(), {
      headers: headers(),
      next: { revalidate: 30, tags: [`product:${handle}`] },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.products?.[0] ?? null
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[getProductByHandle] fetch failed: ${(err as Error).message}`)
    }
    return null
  }
}

export async function getProductAttributes(productId: string) {
  try {
    const url = `${BACKEND_URL}/store/catering-attributes/${productId}`
    const res = await fetch(url, {
      headers: headers(),
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export function priceFromProduct(p: Product): number {
  return p.variants?.[0]?.prices?.[0]?.amount ?? 0
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 0,
  }).format(cents / 100)
}
