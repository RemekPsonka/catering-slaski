import type { MetadataRoute } from "next"
import { listProducts } from "@/lib/products"

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://cateringslaski.pl"

const STATIC_ROUTES: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }> = [
  { path: "/", priority: 1.0, changeFrequency: "daily" },
  { path: "/menu", priority: 0.9, changeFrequency: "daily" },
  { path: "/konfigurator", priority: 0.9, changeFrequency: "weekly" },
  { path: "/lunch", priority: 0.85, changeFrequency: "weekly" },
  { path: "/dla-firm", priority: 0.85, changeFrequency: "monthly" },
  { path: "/dostawa", priority: 0.7, changeFrequency: "monthly" },
  { path: "/o-nas", priority: 0.6, changeFrequency: "monthly" },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: SITE_URL + r.path,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))

  // products — best-effort, fallback to empty if backend unavailable
  let productEntries: MetadataRoute.Sitemap = []
  try {
    const { products } = await listProducts({ limit: 200 })
    productEntries = products.map((p) => ({
      url: `${SITE_URL}/produkt/${p.handle}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))
  } catch {
    // ignore
  }

  return [...staticEntries, ...productEntries]
}
