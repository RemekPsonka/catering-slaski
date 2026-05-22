// @ts-nocheck
/**
 * GET /admin/production/labels?date=YYYY-MM-DD
 *
 * Generuje listę etykiet do druku (po jednej per line item).
 * Każda etykieta: customer, danie, alergeny (RED highlight), QR z order id.
 */
import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const date = String(req.query.date ?? new Date().toISOString().slice(0, 10))
  const orderModule = req.scope.resolve(Modules.ORDER) as any
  const attrService = req.scope.resolve("catering_attributes") as any
  const [orders] = await orderModule.listAndCountOrders(
    {},
    { take: 500, relations: ["items", "shipping_address"] },
  )
  const eligible = (orders ?? []).filter((o: any) => o.metadata?.delivery_date === date)
  const labels: any[] = []
  for (const o of eligible) {
    const customerName = o.shipping_address?.first_name ?? "Klient"
    for (const it of o.items ?? []) {
      // Try to get allergens
      let allergens: string[] | null = null
      let calories: number | null = null
      if (it.product_id && attrService.listAndCountProductAttributes) {
        try {
          const [attrs] = await attrService.listAndCountProductAttributes(
            { product_id: it.product_id },
            { take: 1 },
          )
          allergens = attrs?.[0]?.allergens ?? null
          calories = attrs?.[0]?.calories_kcal ?? null
        } catch {}
      }
      labels.push({
        order_display_id: o.display_id ? `CS-${o.display_id}` : o.id.slice(0, 8),
        customer_name: customerName,
        product_name: it.title,
        product_id: it.product_id,
        line_item_id: it.id,
        portions: it.quantity ?? 1,
        delivery_date: date,
        delivery_slot: (o.metadata as any)?.delivery_slot ?? "—",
        allergens: allergens ?? [],
        calories,
        qr_payload: `cs://order/${o.id}`,
      })
    }
  }
  return res.json({ date, count: labels.length, labels })
}
