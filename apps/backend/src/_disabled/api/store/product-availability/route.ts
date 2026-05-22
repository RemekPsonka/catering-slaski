// @ts-nocheck
/**
 * GET /store/product-availability?product_id=...&date=2026-05-22
 *
 * Storefront PDP / menu używa do sprawdzenia czy danie można dodać na konkretną datę.
 * Zwraca { available, reason?, remaining? }.
 */
import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { PRODUCT_AVAILABILITY_MODULE } from "../../../modules/product-availability"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const productId = String(req.query.product_id ?? "")
  const dateStr = String(req.query.date ?? "")
  if (!productId || !dateStr) {
    return res.status(400).json({ message: "product_id and date required" })
  }
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) {
    return res.status(400).json({ message: "invalid date format (YYYY-MM-DD)" })
  }
  try {
    const svc = req.scope.resolve(PRODUCT_AVAILABILITY_MODULE) as any
    const result = await svc.isAvailableOn(productId, date)
    return res.json(result)
  } catch (err: any) {
    return res.status(500).json({ message: err.message })
  }
}
