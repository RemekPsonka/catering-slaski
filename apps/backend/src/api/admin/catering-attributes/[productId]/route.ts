import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve("catering_attributes") as any
  const productId = req.params.productId
  let item: any = null
  for (const m of ["retrieveByProductId", "retrieveProductAttribute"]) {
    if (typeof svc[m] === "function") {
      item = await svc[m](productId).catch(() => null)
      if (item) break
    }
  }
  if (!item) {
    const [items] = await svc.listAndCountProductAttributes?.({ product_id: productId }, { take: 1 }) ?? [[]]
    item = items?.[0] ?? null
  }
  if (!item) return res.status(404).json({ message: "no attributes" })
  return res.json({ attributes: item })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve("catering_attributes") as any
  const productId = req.params.productId
  const body = req.body as Record<string, unknown>
  // upsert by product_id
  const [existing] = (await svc.listAndCountProductAttributes?.({ product_id: productId }, { take: 1 })) ?? [[]]
  if (existing?.[0]) {
    const updated = await svc.updateProductAttributes({ id: existing[0].id, ...body })
    return res.json({ attributes: updated })
  }
  const created = await svc.createProductAttributes({ product_id: productId, ...body })
  return res.json({ attributes: created })
}
