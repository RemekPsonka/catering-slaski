// @ts-nocheck
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"

/**
 * GET /health — public health check.
 *
 * Returns 200 OK z DB ping + Redis ping (if configured).
 * Używane przez:
 *   - Railway healthcheck (railway.json: healthcheckPath)
 *   - Vercel rewrite probe (sprawdzanie czy backend żyje)
 *   - UptimeRobot / Better Stack monitoring
 *
 * Nie wymaga auth — celowo public, ale nie ujawnia stack version ani PII.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const checks: Record<string, "ok" | "error" | "skipped"> = {}
  const errors: string[] = []
  const t0 = Date.now()

  // Database ping
  try {
    const knex = (req.scope as any).manager?.getConnection?.()?.getKnex?.()
    if (knex) {
      await knex.raw("SELECT 1")
      checks.database = "ok"
    } else {
      checks.database = "skipped"
    }
  } catch (err) {
    checks.database = "error"
    errors.push(`db: ${(err as Error).message}`)
  }

  // Redis ping (optional)
  if (process.env.REDIS_URL) {
    try {
      // Use Medusa's cache module if available — avoids creating extra connection
      const cache = (req.scope as any).resolve?.("cacheService")
      if (cache?.set && cache?.get) {
        await cache.set("health:check", "1", 5)
        checks.redis = "ok"
      } else {
        checks.redis = "skipped"
      }
    } catch (err) {
      checks.redis = "error"
      errors.push(`redis: ${(err as Error).message}`)
    }
  } else {
    checks.redis = "skipped"
  }

  const allHealthy = Object.values(checks).every((s) => s === "ok" || s === "skipped")
  const status = allHealthy ? 200 : 503
  const elapsed = Date.now() - t0

  return res.status(status).json({
    status: allHealthy ? "ok" : "degraded",
    checks,
    elapsed_ms: elapsed,
    errors: errors.length > 0 ? errors : undefined,
    timestamp: new Date().toISOString(),
  })
}
