// @ts-nocheck
import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { DIETARY_PROFILE_MODULE } from "../../../modules/dietary-profile"

/**
 * GET /store/dietary-profile — pobiera profil dietetyczny dla zalogowanego klienta
 * POST /store/dietary-profile — upsert profilu
 *
 * Auth: wymaga zalogowanego customera (Medusa session cookie).
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const auth = (req as any).auth
  if (!auth?.actor_id) {
    return res.status(401).json({ message: "auth required" })
  }
  const svc = req.scope.resolve(DIETARY_PROFILE_MODULE) as any
  const [list] = await svc.listAndCountDietaryProfiles({ customer_id: auth.actor_id }, { take: 1 })
  return res.json({ profile: list?.[0] ?? null })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const auth = (req as any).auth
  if (!auth?.actor_id) {
    return res.status(401).json({ message: "auth required" })
  }
  const svc = req.scope.resolve(DIETARY_PROFILE_MODULE) as any
  const body = (req.body ?? {}) as Record<string, unknown>
  const [list] = await svc.listAndCountDietaryProfiles({ customer_id: auth.actor_id }, { take: 1 })
  if (list?.[0]) {
    const updated = await svc.updateDietaryProfiles({ id: list[0].id, ...body })
    return res.json({ profile: updated })
  }
  const created = await svc.createDietaryProfiles({ customer_id: auth.actor_id, ...body })
  return res.json({ profile: created })
}
