// @ts-nocheck
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { z } from "zod"
import { DELIVERY_ZONES_MODULE } from "../../../modules/delivery-zones"

const QuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
})

/**
 * GET /store/zone-lookup?lat=X&lng=Y
 *
 * Zwraca strefę dostawy dla danego adresu (point-in-polygon).
 * Storefront wywołuje to po wpisaniu adresu w address picker.
 *
 * Response 200 — zone matched
 * Response 404 — out of all zones (pokaż pickup options)
 * Response 400 — invalid coords
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const parsed = QuerySchema.safeParse(req.query)
  if (!parsed.success) {
    return res.status(400).json({
      error: "INVALID_COORDS",
      details: parsed.error.flatten(),
    })
  }

  const deliveryZones = req.scope.resolve(DELIVERY_ZONES_MODULE) as any
  const zone = await deliveryZones.matchAddressToZone(parsed.data.lat, parsed.data.lng)

  if (!zone) {
    return res.status(404).json({
      error: "OUT_OF_ZONE",
      message: "Adres poza naszymi strefami dostawy",
      pickup_options: {
        available: true,
        primary_address: "ul. Marcina Kasprzaka 256, 41-303 Dąbrowa Górnicza",
      },
    })
  }

  return res.status(200).json({ zone })
}
