const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

export type GeocodingResult = {
  lat: number
  lng: number
  formatted: string
  place_name: string
  postal_code?: string
  city?: string
}

/**
 * Geocode polish address using Mapbox Search Box API.
 * Returns best match or null.
 */
export async function geocodeAddress(query: string): Promise<GeocodingResult | null> {
  if (!MAPBOX_TOKEN || query.length < 3) return null

  const url = `https://api.mapbox.com/search/searchbox/v1/forward?q=${encodeURIComponent(query)}&country=pl&language=pl&limit=1&access_token=${MAPBOX_TOKEN}`

  const res = await fetch(url)
  if (!res.ok) return null

  const data = await res.json()
  const feature = data.features?.[0]
  if (!feature) return null

  const [lng, lat] = feature.geometry.coordinates
  const props = feature.properties || {}
  return {
    lat,
    lng,
    formatted: props.full_address || props.place_formatted || query,
    place_name: props.name || props.full_address || query,
    postal_code: props.context?.postcode?.name,
    city: props.context?.place?.name,
  }
}

/**
 * Autocomplete suggestions (for input typing).
 */
export async function suggestAddresses(query: string, sessionToken: string): Promise<Array<{ id: string; name: string; description: string }>> {
  if (!MAPBOX_TOKEN || query.length < 3) return []

  const url = `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(query)}&country=pl&language=pl&limit=5&session_token=${sessionToken}&access_token=${MAPBOX_TOKEN}`

  const res = await fetch(url)
  if (!res.ok) return []

  const data = await res.json()
  return (data.suggestions || []).map((s: any) => ({
    id: s.mapbox_id,
    name: s.name,
    description: s.full_address || s.place_formatted || "",
  }))
}

export async function retrieveSuggestion(mapboxId: string, sessionToken: string): Promise<GeocodingResult | null> {
  if (!MAPBOX_TOKEN) return null

  const url = `https://api.mapbox.com/search/searchbox/v1/retrieve/${mapboxId}?session_token=${sessionToken}&access_token=${MAPBOX_TOKEN}`

  const res = await fetch(url)
  if (!res.ok) return null

  const data = await res.json()
  const feature = data.features?.[0]
  if (!feature) return null

  const [lng, lat] = feature.geometry.coordinates
  const props = feature.properties || {}
  return {
    lat,
    lng,
    formatted: props.full_address || props.place_formatted,
    place_name: props.name,
    postal_code: props.context?.postcode?.name,
    city: props.context?.place?.name,
  }
}
