"use client"
import { useState } from "react"
import { lookupPostal, type PostalLookupResult } from "@/lib/delivery/postal-lookup"
import { track } from "@/lib/analytics"
import { MapPin, AlertCircle, Truck, Package, Clock } from "lucide-react"

/**
 * Kod pocztowy → strefa + dostępne metody dostawy.
 * Po pierwszym zapytaniu wyświetla:
 *   - matched_zone: pokazuje strefę + listę metod
 *   - capture_lead: pokazuje newsletter signup
 */
export function PostalLookup({ onMatched }: { onMatched?: (r: PostalLookupResult) => void }) {
  const [code, setCode] = useState("")
  const [result, setResult] = useState<PostalLookupResult | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.match(/^\d{2}-?\d{3}$/)) return
    setLoading(true)
    const r = await lookupPostal(code)
    setResult(r)
    if (r) {
      track({
        event: "zone_checked",
        zone_slug: r.matched_zone?.slug,
        zone_available: !!r.matched_zone,
        postal_code: r.normalized_code,
      })
      onMatched?.(r)
    }
    setLoading(false)
  }

  return (
    <div className="bg-snow-50 border border-bone-200 p-5">
      <form onSubmit={submit} className="flex gap-2 items-stretch">
        <div className="flex-1 flex items-center border-2 border-coal-900 bg-paper-100">
          <MapPin size={18} className="ml-3 text-graphite-500 flex-shrink-0" />
          <input
            type="text"
            inputMode="numeric"
            placeholder="40-159"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
            className="bg-transparent px-3 py-2.5 w-full font-mono text-base outline-none"
            aria-label="Kod pocztowy"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-coal-900 hover:bg-coal-900/90 text-snow-50 font-semibold uppercase tracking-wide px-5 py-2.5 disabled:opacity-50"
        >
          {loading ? "..." : "Sprawdź"}
        </button>
      </form>

      {result?.matched_zone && (
        <div className="mt-4 border-l-2 border-signal-500 pl-4">
          <div className="text-sm">
            <strong className="text-coal-900">Strefa: {result.matched_zone.name}</strong>
            <span className="text-coal-900/60"> · {result.normalized_code}</span>
          </div>
          {result.supported_methods && result.supported_methods.length > 0 && (
            <ul className="mt-3 space-y-2">
              {result.supported_methods.map((m) => (
                <li key={m.code} className="flex items-start gap-2.5 text-sm">
                  {m.code.startsWith("pickup") ? (
                    <Package size={16} className="mt-1 text-signal-500 flex-shrink-0" />
                  ) : (
                    <Truck size={16} className="mt-1 text-signal-500 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{m.name}</span>
                      <span className="font-mono num">
                        {m.default_cost_cents === 0 ? "Bezpłatnie" : `+${(m.default_cost_cents / 100).toFixed(0)} zł`}
                      </span>
                    </div>
                    {m.description && (
                      <p className="text-coal-900/60 text-xs mt-0.5">{m.description}</p>
                    )}
                    <p className="text-coal-900/50 text-xs mt-0.5">
                      <Clock size={11} className="inline mr-1 -mt-0.5" />
                      Cut-off {m.default_cutoff_hour}:00, lead +{m.default_lead_time_days}d
                      {m.requires_thermal_packaging && " · ❄️ chłodnia"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {result?.capture_lead && (
        <div className="mt-4 border-l-2 border-graphite-500 pl-4">
          <AlertCircle size={16} className="text-graphite-500 inline mr-2" />
          <span className="text-sm text-coal-900/80">
            Niestety jeszcze tu nie dostarczamy ({result.normalized_code}).
          </span>
          <p className="text-sm text-coal-900/60 mt-2">
            Zapisz się na powiadomienie — odezwiemy się, gdy otworzymy strefę.
          </p>
          {/* TODO: inline newsletter signup form */}
        </div>
      )}
    </div>
  )
}
