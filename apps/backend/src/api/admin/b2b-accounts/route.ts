import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { B2B_ACCOUNTS_MODULE } from "../../../modules/b2b-accounts"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve(B2B_ACCOUNTS_MODULE) as any
  const [accounts, count] = await svc.listAndCountB2BAccounts({}, { take: 200 })
  return res.json({ b2b_accounts: accounts, count })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve(B2B_ACCOUNTS_MODULE) as any
  const created = await svc.createB2BAccounts(req.body as Record<string, unknown>)
  return res.json({ b2b_account: created })
}
