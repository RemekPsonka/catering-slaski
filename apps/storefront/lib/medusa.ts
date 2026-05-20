import Medusa from "@medusajs/js-sdk"

export const medusa = new Medusa({
  baseUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000",
  debug: process.env.NODE_ENV === "development",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})

// Helpers for custom catering APIs

export type Zone = {
  id: string
  name: string
  slug: string
  zone_type: "local" | "regional" | "national"
  delivery_method: string
  base_delivery_fee_cents: number
  delivery_fee_pln: number
  lead_time_days: number
  cutoff_hour: number
  cutoff_today_passed: boolean
  available_categories: string[]
  next_available_dates: string[]
  display_color: string
  distance_to_center_km?: number
}

export async function lookupZone(lat: number, lng: number): Promise<Zone | null> {
  const url = new URL(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/zone-lookup`)
  url.searchParams.set("lat", String(lat))
  url.searchParams.set("lng", String(lng))

  const res = await fetch(url.toString(), { cache: "no-store" })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Zone lookup failed: ${res.status}`)
  const data = await res.json()
  return data.zone
}

export type TimeSlot = {
  id: string
  slot_date: string
  time_from: string
  time_to: string
  capacity: number
  booked_count: number
  available: number
  status: "open" | "full" | "blocked" | "closed"
}

export async function getTimeSlots(zoneId: string, date: string): Promise<TimeSlot[]> {
  const url = new URL(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/time-slots`)
  url.searchParams.set("zone_id", zoneId)
  url.searchParams.set("date", date)
  const res = await fetch(url.toString(), { next: { revalidate: 30 } })
  if (!res.ok) throw new Error(`Time slots fetch failed: ${res.status}`)
  const data = await res.json()
  return data.slots
}

export async function reserveSlot(slotId: string, cartId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/time-slots/reserve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slot_id: slotId, cart_id: cartId }),
  })
  return await res.json()
}

export async function generateAIMenu(brief: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/ai/generate-menu`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ brief }),
  })
  return await res.json()
}
