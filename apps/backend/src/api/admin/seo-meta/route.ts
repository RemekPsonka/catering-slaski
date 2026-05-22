// @ts-nocheck
/**
 * Admin CRUD for SEO overrides.
 * GET    /admin/seo-meta?path=&limit=&offset=&q=
 * POST   /admin/seo-meta  body: { path, title, ... }
 */
import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { SEO_META_MODULE } from "../../../modules/seo-meta"
import { z } from "zod"

const createSchema = z.object({
  path: z.string().min(1).max(512),
  title: z.string().max(255).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  og_title: z.string().max(255).optional().nullable(),
  og_description: z.string().max(500).optional().nullable(),
  og_image: z.string().url().optional().nullable(),
  twitter_title: z.string().max(255).optional().nullable(),
  twitter_description: z.string().max(500).optional().nullable(),
  twitter_image: z.string().url().optional().nullable(),
  canonical: z.string().max(512).optional().nullable(),
  robots: z.string().max(64).optional().nullable(),
  keywords: z.array(z.string()).optional().nullable(),
  json_ld: z.any().optional().nullable(),
  is_active: z.boolean().optional().default(true),
  notes: z.string().max(2000).optional().nullable(),
})

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve(SEO_META_MODULE) as any
  const limit = Math.min(Number(req.query.limit ?? 50), 200)
  const offset = Number(req.query.offset ?? 0)
  const path = req.query.path as string | undefined
  const filters: Record<string, unknown> = {}
  if (path) filters.path = path
  const [items, count] = await svc.listAndCountSeoMetas(filters, { take: limit, skip: offset })
  return res.json({ seo_metas: items, count })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ message: "invalid", errors: parsed.error.flatten() })
  }
  const svc = req.scope.resolve(SEO_META_MODULE) as any
  // Upsert by path
  const [existing] = await svc.listAndCountSeoMetas({ path: parsed.data.path }, { take: 1 })
  if (existing?.length) {
    const updated = await svc.updateSeoMetas({ id: existing[0].id, ...parsed.data })
    return res.json({ seo_meta: updated })
  }
  const created = await svc.createSeoMetas(parsed.data)
  return res.status(201).json({ seo_meta: created })
}
