/**
 * GET /store/postal-lookup?code=40-159
 *
 * Zwraca:
 *   - matched_zone: pierwszy zone gdzie postal_codes zawiera ten kod
 *   - supported_methods: dla strefy
 *   - lub matched_zone: null + capture_lead: true → storefront pokazuje newsletter signup
 *
 * Fast path: tylko po `postal_codes` json (text search). Nie wywołuje PostGIS.
 * Dla pełnego matchu (z lat/lng) — używaj /store/zone-lookup.
 */
import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const code = String(req.query.code ?? "").trim()
  if (!code) {
    return res.status(400).json({ message: "code query param required" })
  }
  // Normalize: "40-159" lub "40159" both work
  const normalized = code.replace(/\s/g, "").replace(/^(\d{2})-?(\d{3})$/, "$1-$2")
  if (!/^\d{2}-\d{3}$/.test(normalized)) {
    return res.status(400).json({ message: "invalid PL postal code format (XX-XXX)" })
  }
  try {
    const zoneService = req.scope.resolve("delivery_zones") as any
    const methodsService = req.scope.resolve("delivery_methods") as any
    const [zones] = await zoneService.listAndCountDeliveryZones(
      { is_active: true },
      { take: 100, order: { priority: "DESC" } },
    )
    // Match by postal_codes JSON array
    const matched = (zones ?? []).find((z: any) =>
      Array.isArray(z.postal_codes) &&
      z.postal_codes.map((c: string) => c.toString()).includes(normalized),
    )
    if (!matched) {
      return res.status(404).json({
        matched_zone: null,
        capture_lead: true,
        normalized_code: normalized,
        message: "Postal code not in any active delivery zone",
      })
    }
    // Resolve supported methods
    const supportedCodes: string[] = matched.supported_methods ?? (
      matched.delivery_method ? [matched.delivery_method] : []
    )
    const [methods] = supportedCodes.length
      ? await methodsService.listAndCountDeliveryMethods({ is_active: true }, { take: 50 })
      : [[]]
    const methodsForZone = (methods ?? []).filter((m: any) => supportedCodes.includes(m.code))

    return res.json({
      matched_zone: matched,
      normalized_code: normalized,
      supported_methods: methodsForZone,
    })
  } catch (err: any) {
    req.scope.resolve("logger")?.error?.(`postal-lookup: ${err.message}`)
    return res.status(500).json({ message: err.message })
  }
}
