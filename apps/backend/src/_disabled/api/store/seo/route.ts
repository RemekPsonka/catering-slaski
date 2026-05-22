// @ts-nocheck
/**
 * GET /store/seo?path=/produkt/zurek-slaski
 * Returns admin-managed SEO override for a URL path. Storefront merges it
 * with code-default metadata. 404 → no override, use defaults.
 */
import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { SEO_META_MODULE } from "../../../modules/seo-meta"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const path = (req.query.path as string) ?? ""
  if (!path) {
    return res.status(400).json({ message: "path query param required" })
  }
  try {
    const seoService = req.scope.resolve(SEO_META_MODULE) as any
    const [list] = await seoService.listAndCountSeoMetas({ path, is_active: true }, { take: 1 })
    if (!list?.length) {
      return res.status(404).json({ message: "no override" })
    }
    return res.json({ seo: list[0] })
  } catch (err: any) {
    req.scope.resolve("logger")?.error?.(`seo route error: ${err.message}`)
    return res.status(500).json({ message: "internal" })
  }
}
