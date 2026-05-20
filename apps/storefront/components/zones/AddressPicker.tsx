"use client"

import { useState, useEffect, useId } from "react"
import { suggestAddresses, retrieveSuggestion, type GeocodingResult } from "@/lib/mapbox"
import { lookupZone, type Zone } from "@/lib/medusa"
import { MapPin, Loader2, Check, AlertCircle } from "lucide-react"

type Status = "idle" | "searching" | "suggestions" | "looking-up" | "matched" | "out-of-zone" | "error"

export function AddressPicker({ onZoneMatched }: { onZoneMatched?: (zone: Zone, address: GeocodingResult) => void }) {
  const sessionToken = useId()
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<Array<{ id: string; name: string; description: string }>>([])
  const [status, setStatus] = useState<Status>("idle")
  const [zone, setZone] = useState<Zone | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Debounced autocomplete
  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([])
      setStatus("idle")
      return
    }
    setStatus("searching")
    const timeout = setTimeout(async () => {
      try {
        const results = await suggestAddresses(query, sessionToken)
        setSuggestions(results)
        setStatus(results.length > 0 ? "suggestions" : "idle")
      } catch {
        setStatus("error")
        setError("Nie udało się pobrać podpowiedzi adresów")
      }
    }, 300)
    return () => clearTimeout(timeout)
  }, [query, sessionToken])

  async function handleSelect(mapboxId: string) {
    setStatus("looking-up")
    setSuggestions([])

    try {
      const result = await retrieveSuggestion(mapboxId, sessionToken)
      if (!result) {
        setStatus("error")
        setError("Nie udało się pobrać szczegółów adresu")
        return
      }
      setQuery(result.formatted)

      const matchedZone = await lookupZone(result.lat, result.lng)
      if (!matchedZone) {
        setStatus("out-of-zone")
        setZone(null)
        return
      }
      setZone(matchedZone)
      setStatus("matched")
      onZoneMatched?.(matchedZone, result)
    } catch (err: any) {
      setStatus("error")
      setError(err.message)
    }
  }

  return (
    <div className="w-full max-w-xl">
      <label className="label text-graphite-500 mb-2 block">Adres dostawy</label>
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-graphite-500" size={18} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ul. Mariacka 5, Katowice"
          className="w-full bg-snow-50 border border-coal-900 pl-12 pr-12 py-4 text-coal-900 placeholder:text-graphite-500 focus:outline-none focus:ring-0"
        />
        {(status === "searching" || status === "looking-up") && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-signal-500 animate-spin" size={18} />
        )}
        {status === "matched" && (
          <Check className="absolute right-4 top-1/2 -translate-y-1/2 text-success-500" size={20} />
        )}
      </div>

      {/* Suggestions dropdown */}
      {status === "suggestions" && suggestions.length > 0 && (
        <div className="border border-coal-900 border-t-0 bg-snow-50 max-h-72 overflow-y-auto">
          {suggestions.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSelect(s.id)}
              className="w-full text-left px-5 py-3 hover:bg-bone-200 transition border-b border-bone-200 last:border-b-0"
            >
              <div className="font-medium text-coal-900">{s.name}</div>
              <div className="text-xs text-graphite-500 mt-0.5">{s.description}</div>
            </button>
          ))}
        </div>
      )}

      {/* Zone matched */}
      {status === "matched" && zone && (
        <div className="mt-4 p-5 border-2 border-success-500 bg-success-500/5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="label text-success-700 mb-1">Strefa znaleziona</div>
              <div className="display upper font-bold text-coal-900 text-xl">{zone.name}</div>
              <div className="mt-2 text-sm text-coal-900/70">
                Dostawa: <strong className="text-coal-900">{zone.delivery_fee_pln} zł</strong>
                {" · "}
                Najwcześniejsza: <strong>{new Date(zone.next_available_dates[0]).toLocaleDateString("pl-PL", { day: "numeric", month: "long" })}</strong>
              </div>
              <div className="mt-1 text-xs text-graphite-500">
                Dostępne: {zone.available_categories.join(", ")}
              </div>
            </div>
            <div
              className="w-3 h-12"
              style={{ backgroundColor: zone.display_color }}
              aria-hidden="true"
            />
          </div>
        </div>
      )}

      {/* Out of zone */}
      {status === "out-of-zone" && (
        <div className="mt-4 p-5 border-2 border-warning-500 bg-warning-500/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-warning-500 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <div className="font-medium text-coal-900">Adres poza naszymi strefami</div>
              <div className="text-sm text-coal-900/70 mt-1">
                Możemy dostarczyć kurierem (catering boxy) lub zaproponować odbiór osobisty
                w Dąbrowie Górniczej (ul. Marcina Kasprzaka 256).
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {status === "error" && error && (
        <div className="mt-4 p-4 border border-error-500 bg-error-500/5 text-sm text-error-500">
          {error}
        </div>
      )}
    </div>
  )
}
