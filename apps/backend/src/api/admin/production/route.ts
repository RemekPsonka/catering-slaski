/**
 * GET /admin/production?date=YYYY-MM-DD — production run dla daty (lub buduje na żywo)
 * POST /admin/production { production_date } — utwórz run i zliczy line items
 */
import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { PRODUCTION_MODULE } from "../../../modules/production"
import { Modules } from "@medusajs/framework/utils"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const date = String(req.query.date ?? new Date().toISOString().slice(0, 10))
  const svc = req.scope.resolve(PRODUCTION_MODULE) as any
  const orderModule = req.scope.resolve(Modules.ORDER) as any

  // Czy production run istnieje
  const [runs] = await svc.listAndCountProductionRuns({ production_date: date }, { take: 1 })
  let run = runs?.[0]

  if (!run) {
    // Buduj live aggregation - confirmed orders with delivery_date = date
    const [orders] = await orderModule.listAndCountOrders(
      {},
      { take: 500, relations: ["items"] },
    )
    const eligible = (orders ?? []).filter((o: any) => {
      const meta = o.metadata ?? {}
      return meta.delivery_date === date && o.status !== "canceled"
    })
    const aggregate = new Map<string, { product_id: string; name: string; qty: number; allergens?: string[] }>()
    const orderIds: string[] = []
    for (const o of eligible) {
      orderIds.push(o.id)
      for (const it of o.items ?? []) {
        const key = it.product_id ?? it.variant_id ?? it.id
        const ex = aggregate.get(key) ?? { product_id: key, name: it.title ?? "?", qty: 0 }
        ex.qty += it.quantity ?? 1
        aggregate.set(key, ex)
      }
    }
    run = {
      id: null,
      production_date: date,
      status: "planned",
      order_ids: orderIds,
      aggregated_items: Array.from(aggregate.values()).sort((a, b) => b.qty - a.qty),
    }
  }
  return res.json({ production_run: run })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as any
  const date = String(body.production_date ?? new Date().toISOString().slice(0, 10))
  const svc = req.scope.resolve(PRODUCTION_MODULE) as any
  // Trigger GET path to compute aggregate, then persist
  const orderModule = req.scope.resolve(Modules.ORDER) as any
  const [orders] = await orderModule.listAndCountOrders({}, { take: 500, relations: ["items"] })
  const eligible = (orders ?? []).filter((o: any) => o.metadata?.delivery_date === date)
  const aggregate = new Map<string, any>()
  const orderIds: string[] = []
  for (const o of eligible) {
    orderIds.push(o.id)
    for (const it of o.items ?? []) {
      const key = it.product_id ?? it.id
      const ex = aggregate.get(key) ?? { product_id: key, name: it.title, qty: 0 }
      ex.qty += it.quantity ?? 1
      aggregate.set(key, ex)
    }
  }
  const created = await svc.createProductionRuns({
    production_date: date,
    status: "planned",
    order_ids: orderIds,
    aggregated_items: Array.from(aggregate.values()),
  })
  return res.json({ production_run: created })
}
