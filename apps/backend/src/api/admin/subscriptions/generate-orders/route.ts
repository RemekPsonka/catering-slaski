import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

/**
 * Trigger the subscriptions-generate-orders job on demand from admin UI.
 * Pure passthrough: imports the job handler and runs it once with current container.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const mod: any = await import("../../../../jobs/subscriptions-generate-orders")
    const handler = mod.default ?? mod
    if (typeof handler !== "function") {
      return res.status(500).json({ message: "job handler not callable" })
    }
    await handler(req.scope)
    return res.json({ ok: true })
  } catch (err: any) {
    req.scope.resolve("logger")?.error?.(`generate-orders trigger failed: ${err.message}`)
    return res.status(500).json({ message: err.message })
  }
}
