/**
 * Client-side postal code lookup.
 * Calls /store/postal-lookup, caches with SWR.
 */
const BACKEND = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || ""
const PUBKEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

export type PostalLookupResult = {
  matched_zone: {
    id: string
    name: string
    slug: string
    zone_type: string
    base_delivery_fee_cents: number
    free_delivery_threshold_cents?: number | null
    min_order_cents: number
    lead_time_days: number
    cutoff_hour: number
    delivery_days?: number[] | null
    requires_thermal_packaging?: boolean
  } | null
  supported_methods?: Array<{
    code: string
    name: string
    description?: string | null
    default_cost_cents: number
    default_cutoff_hour: number
    default_lead_time_days: number
    requires_thermal_packaging: boolean
    supports_same_day: boolean
    has_tracking: boolean
  }>
  capture_lead?: boolean
  normalized_code?: string
}

export async function lookupPostal(code: string): Promise<PostalLookupResult | null> {
  if (!BACKEND) return null
  try {
    const url = new URL(BACKEND + "/store/postal-lookup")
    url.searchParams.set("code", code)
    const res = await fetch(url.toString(), {
      headers: PUBKEY ? { "x-publishable-api-key": PUBKEY } : {},
    })
    if (res.status === 404) {
      return (await res.json()) as PostalLookupResult
    }
    if (!res.ok) return null
    return (await res.json()) as PostalLookupResult
  } catch {
    return null
  }
}
