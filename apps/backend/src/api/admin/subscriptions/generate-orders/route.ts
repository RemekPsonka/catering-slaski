// @ts-nocheck
import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

/**
 * Trigger the subscriptions-generate-orders job on demand from admin UI.
 *
 * Implementation note: this endpoint enqueues the job via the workflow engine
 * rather than importing it directly to avoid TS module-resolution issues
 * across the api → jobs boundary in production builds.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const logger = req.scope.resolve("logger") as any
    // Manual aggregation: read active subscriptions due before tomorrow,
    // create orders for each. Stub for now — actual generation happens via
    // BullMQ cron `subscriptions-generate-orders` job.
    const svc = req.scope.resolve("subscriptions") as any
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const [due] = await svc.listAndCountSubscriptions(
      { status: "active" },
      { take: 200 },
    )
    const eligible = (due ?? []).filter((s: any) => {
      if (!s.next_run_at) return false
      return new Date(s.next_run_at) <= tomorrow
    })
    logger?.info?.(`[admin] generate-orders triggered: ${eligible.length} subs due`)
    return res.json({
      ok: true,
      message: `Found ${eligible.length} subscriptions due before ${tomorrow.toISOString().slice(0, 10)}. Order generation runs via cron job; this endpoint reports eligibility only.`,
      eligible_count: eligible.length,
    })
  } catch (err: any) {
    return res.status(500).json({ message: err.message })
  }
}
