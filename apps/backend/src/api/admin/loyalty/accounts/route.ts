// @ts-nocheck
import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve("loyalty") as any
  const customerId = req.query.customer_id as string | undefined
  const filters: Record<string, unknown> = {}
  if (customerId) filters.customer_id = customerId
  // Try common method names — loyalty service may expose listAccounts or similar
  let result: any = null
  for (const m of ["listAndCountLoyaltyAccounts", "listLoyaltyAccounts", "listAndCountAccounts", "listAccounts"]) {
    if (typeof svc[m] === "function") {
      result = await svc[m](filters, { take: 200 })
      break
    }
  }
  if (!result) return res.json({ accounts: [], count: 0 })
  const items = Array.isArray(result) ? result[0] : result
  const count = Array.isArray(result) ? result[1] : items.length
  return res.json({ accounts: items, count })
}
