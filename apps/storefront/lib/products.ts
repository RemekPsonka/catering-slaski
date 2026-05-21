/**
 * Server-side product fetchers — used by RSC pages.
 *
 * Strategy:
 *   1. Try Medusa REST API at NEXT_PUBLIC_MEDUSA_BACKEND_URL (when backend is deployed)
 *   2. Fall back to Supabase cs.products table (works without backend — catalog only)
 *   3. Final fallback: empty array → page shows PLACEHOLDER_PRODUCTS
 */
import { createClient } from "@supabase/supabase-js"

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || ""
const PUB_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

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

type SupabaseRow = {
  id: string
  handle: string
  title: string
  description: string | null
  category: string
  price_cents: number
  thumbnail: string | null
  portions_min: number | null
  portions_max: number | null
  portions_label: string | null
  is_vegetarian: boolean
  is_vegan: boolean
  is_gluten_free: boolean
  is_bestseller: boolean
  is_new: boolean
  allergens: string[] | null
  contents: string[] | null
  occasion_tags: string[] | null
  season_tags: string[] | null
  rating_avg: number | null
  rating_count: number
}

function rowToProduct(r: SupabaseRow): Product {
  return {
    id: r.id,
    handle: r.handle,
    title: r.title,
    description: r.description ?? "",
    thumbnail: r.thumbnail,
    images: r.thumbnail ? [r.thumbnail] : [],
    variants: [
      {
        id: r.id + "_default",
        title: "Default",
        prices: [{ amount: r.price_cents, currency_code: "pln" }],
      },
    ],
    metadata: { category: r.category },
    attributes: {
      portions_label: r.portions_label ?? undefined,
      is_vegetarian: r.is_vegetarian,
      is_vegan: r.is_vegan,
      is_gluten_free: r.is_gluten_free,
      is_bestseller: r.is_bestseller,
      is_new: r.is_new,
      allergens: r.allergens ?? undefined,
      contents: r.contents ?? undefined,
      occasion_tags: r.occasion_tags ?? undefined,
      rating_avg: r.rating_avg ?? undefined,
      rating_count: r.rating_count,
    },
  }
}

function supa() {
  if (!SUPABASE_URL || !SUPABASE_ANON) return null
  return createClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: "cs" },
  })
}

async function fetchFromSupabase(opts: {
  category?: string
  limit?: number
  offset?: number
  bestseller?: boolean
}): Promise<{ products: Product[]; count: number }> {
  const client = supa()
  if (!client) return { products: [], count: 0 }
  try {
    let q = client.from("products").select("*", { count: "exact" })
    if (opts.category) q = q.eq("category", opts.category)
    if (opts.bestseller) q = q.eq("is_bestseller", true)
    q = q.order("is_bestseller", { ascending: false }).order("price_cents", { ascending: true })
    q = q.range(opts.offset ?? 0, (opts.offset ?? 0) + (opts.limit ?? 24) - 1)
    const { data, count, error } = await q
    if (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[supabase listProducts] " + error.message)
      }
      return { products: [], count: 0 }
    }
    return {
      products: (data as SupabaseRow[] | null)?.map(rowToProduct) ?? [],
      count: count ?? 0,
    }
  } catch (err) {
    return { products: [], count: 0 }
  }
}

async function fetchFromMedusa(opts: {
  category?: string
  limit?: number
  offset?: number
}): Promise<{ products: Product[]; count: number } | null> {
  if (!BACKEND_URL) return null
  try {
    const url = new URL(BACKEND_URL + "/store/products")
    url.searchParams.set("limit", String(opts.limit ?? 24))
    url.searchParams.set("offset", String(opts.offset ?? 0))
    if (opts.category) url.searchParams.set("category", opts.category)
    const res = await fetch(url.toString(), {
      headers: headers(),
      next: { revalidate: 60, tags: ["products"] },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null
    const data = await res.json()
    return { products: data.products ?? [], count: data.count ?? 0 }
  } catch {
    return null
  }
}

export async function listProducts(opts: {
  category?: string
  limit?: number
  offset?: number
  diet?: string[]
  bestseller?: boolean
} = {}): Promise<{ products: Product[]; count: number }> {
  const m = await fetchFromMedusa(opts)
  if (m && m.products.length > 0) return m
  const s = await fetchFromSupabase(opts)
  if (s.products.length > 0) return s
  return { products: [], count: 0 }
}

export async function getProductByHandle(handle: string): Promise<Product | null> {
  if (BACKEND_URL) {
    try {
      const url = new URL(BACKEND_URL + "/store/products")
      url.searchParams.set("handle", handle)
      url.searchParams.set("limit", "1")
      const res = await fetch(url.toString(), {
        headers: headers(),
        next: { revalidate: 30, tags: ["product:" + handle] },
        signal: AbortSignal.timeout(5000),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.products?.[0]) return data.products[0]
      }
    } catch {}
  }
  const client = supa()
  if (!client) return null
  try {
    const { data, error } = await client.from("products").select("*").eq("handle", handle).maybeSingle()
    if (error || !data) return null
    return rowToProduct(data as SupabaseRow)
  } catch {
    return null
  }
}

export async function getProductAttributes(productId: string) {
  if (!BACKEND_URL) return null
  try {
    const url = BACKEND_URL + "/store/catering-attributes/" + productId
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
