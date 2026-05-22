// @ts-nocheck
/**
 * GET /admin/production/manifests?date=YYYY-MM-DD&zone_id=...
 *
 * Generuje load manifest (lista załadunkowa) per kierowca/strefa/okienko.
 * Output: JSON, klient (admin UI) renderuje PDF.
 */
import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const date = String(req.query.date ?? new Date().toISOString().slice(0, 10))
  const zoneId = req.query.zone_id as string | undefined
  const orderModule = req.scope.resolve(Modules.ORDER) as any
  const [orders] = await orderModule.listAndCountOrders(
    {},
    { take: 500, relations: ["items", "shipping_address"] },
  )
  const eligible = (orders ?? []).filter((o: any) => {
    const meta = o.metadata ?? {}
    if (meta.delivery_date !== date) return false
    if (zoneId && meta.delivery_zone_id !== zoneId) return false
    return true
  })
  // Group by slot
  const groups: Record<string, any[]> = {}
  for (const o of eligible) {
    const slot = (o.metadata as any)?.delivery_slot ?? "no-slot"
    if (!groups[slot]) groups[slot] = []
    groups[slot].push({
      order_id: o.id,
      display_id: o.display_id,
      customer_name: o.shipping_address?.first_name
        ? `${o.shipping_address.first_name} ${o.shipping_address.last_name ?? ""}`.trim()
        : "—",
      address_1: o.shipping_address?.address_1 ?? "",
      city: o.shipping_address?.city ?? "",
      postal_code: o.shipping_address?.postal_code ?? "",
      phone: o.shipping_address?.phone ?? "",
      items: (o.items ?? []).map((i: any) => ({
        name: i.title,
        qty: i.quantity,
      })),
      total_cents: Math.round((Number(o.total) || 0) * 100),
      notes: (o.metadata as any)?.delivery_notes ?? "",
    })
  }
  return res.json({
    date,
    zone_id: zoneId,
    slots: Object.entries(groups).map(([slot, stops]) => ({
      slot,
      stops,
      total_stops: stops.length,
    })),
  })
}
