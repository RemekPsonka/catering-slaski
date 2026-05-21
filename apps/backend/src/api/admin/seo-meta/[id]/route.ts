import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { SEO_META_MODULE } from "../../../../modules/seo-meta"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve(SEO_META_MODULE) as any
  const id = req.params.id
  const item = await svc.retrieveSeoMeta(id).catch(() => null)
  if (!item) return res.status(404).json({ message: "not found" })
  return res.json({ seo_meta: item })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve(SEO_META_MODULE) as any
  const id = req.params.id
  const body = req.body as Record<string, unknown>
  const updated = await svc.updateSeoMetas({ id, ...body })
  return res.json({ seo_meta: updated })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve(SEO_META_MODULE) as any
  await svc.deleteSeoMetas(req.params.id)
  return res.json({ deleted: true })
}
