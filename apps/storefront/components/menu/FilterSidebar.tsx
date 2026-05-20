"use client"

import { useState, useTransition, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { ArrowRight } from "lucide-react"

export function FilterSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()

  // Initialize from URL
  const [priceMax, setPriceMax] = useState<number>(() =>
    parseInt(searchParams.get("price_max") || "1500")
  )
  const [diet, setDiet] = useState<string[]>(() =>
    (searchParams.get("diet") || "").split(",").filter(Boolean)
  )
  const [occasion, setOccasion] = useState<string[]>(() =>
    (searchParams.get("occasion") || "").split(",").filter(Boolean)
  )
  const [guests, setGuests] = useState<string[]>(() =>
    (searchParams.get("guests") || "").split(",").filter(Boolean)
  )

  // Build URL on changes (debounced via useTransition)
  function updateUrl(updates: Partial<{ diet: string[]; occasion: string[]; guests: string[]; price_max: number }>) {
    const params = new URLSearchParams(searchParams.toString())
    const newDiet      = updates.diet      ?? diet
    const newOccasion  = updates.occasion  ?? occasion
    const newGuests    = updates.guests    ?? guests
    const newPriceMax  = updates.price_max ?? priceMax

    if (newDiet.length > 0) params.set("diet", newDiet.join(","))
    else params.delete("diet")
    if (newOccasion.length > 0) params.set("occasion", newOccasion.join(","))
    else params.delete("occasion")
    if (newGuests.length > 0) params.set("guests", newGuests.join(","))
    else params.delete("guests")
    if (newPriceMax !== 1500) params.set("price_max", String(newPriceMax))
    else params.delete("price_max")

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  function toggleIn(list: string[], val: string): string[] {
    return list.includes(val) ? list.filter((v) => v !== val) : [...list, val]
  }

  function clearAll() {
    setDiet([]); setOccasion([]); setGuests([]); setPriceMax(1500)
    startTransition(() => router.replace(pathname, { scroll: false }))
  }

  const activeCount = diet.length + occasion.length + guests.length + (priceMax !== 1500 ? 1 : 0)

  return (
    <div className={`bg-snow-50 border border-coal-900/10 p-6 lg:sticky lg:top-44 ${pending ? "opacity-70" : ""} transition`}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="display upper-tight font-bold text-xl text-coal-900">Filtry</h3>
        {activeCount > 0 && (
          <button onClick={clearAll} className="text-xs text-signal-500 hover:text-signal-600">
            Wyczyść ({activeCount})
          </button>
        )}
      </div>

      {/* Liczba osób */}
      <div className="mb-6 pb-6 border-b border-coal-900/10">
        <h4 className="label text-coal-900 mb-3">Liczba osób</h4>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {["5-10", "10-20", "20-40", "40+", "80+", "150+"].map((range) => {
            const active = guests.includes(range)
            return (
              <button
                key={range}
                onClick={() => {
                  const next = toggleIn(guests, range)
                  setGuests(next); updateUrl({ guests: next })
                }}
                className={`py-2 px-3 border transition num ${
                  active
                    ? "bg-coal-900 text-paper-100 border-coal-900"
                    : "border-coal-900/15 hover:bg-coal-900 hover:text-paper-100"
                }`}
              >
                {range}
              </button>
            )
          })}
        </div>
      </div>

      {/* Dieta */}
      <div className="mb-6 pb-6 border-b border-coal-900/10">
        <h4 className="label text-coal-900 mb-3">Dieta</h4>
        <div className="space-y-2.5 text-sm">
          {[
            { v: "vege",  label: "🌱 Wegetariańskie" },
            { v: "vegan", label: "🥬 Wegańskie" },
            { v: "gf",    label: "🌾 Bezglutenowe" },
            { v: "lact",  label: "🥛 Bez laktozy" },
            { v: "spicy", label: "🌶️ Pikantne" },
          ].map((item) => (
            <label key={item.v} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={diet.includes(item.v)}
                onChange={() => {
                  const next = toggleIn(diet, item.v)
                  setDiet(next); updateUrl({ diet: next })
                }}
                className="w-4 h-4 accent-coal-900"
              />
              <span className="text-coal-900/80 group-hover:text-coal-900">{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Cena */}
      <div className="mb-6 pb-6 border-b border-coal-900/10">
        <h4 className="label text-coal-900 mb-3">Cena</h4>
        <div className="flex justify-between text-xs text-coal-900/60 mb-2 num">
          <span>50 zł</span>
          <span>1500 zł</span>
        </div>
        <input
          type="range"
          min={50}
          max={1500}
          step={50}
          value={priceMax}
          onChange={(e) => setPriceMax(Number(e.target.value))}
          onMouseUp={() => updateUrl({ price_max: priceMax })}
          onTouchEnd={() => updateUrl({ price_max: priceMax })}
          className="w-full accent-signal-500"
        />
        <div className="text-xs text-coal-900/70 mt-2">
          do <strong className="text-coal-900 num">{priceMax} zł</strong>
        </div>
      </div>

      {/* Okazja */}
      <div className="mb-6">
        <h4 className="label text-coal-900 mb-3">Okazja</h4>
        <div className="space-y-2 text-sm">
          {[
            { v: "komunia",   label: "Komunia / chrzciny" },
            { v: "urodziny",  label: "Urodziny / jubileusz" },
            { v: "wesele",    label: "Wesele" },
            { v: "firmowe",   label: "Event firmowy" },
            { v: "sylwester", label: "Sylwester / święta" },
          ].map((opt) => (
            <label key={opt.v} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={occasion.includes(opt.v)}
                onChange={() => {
                  const next = toggleIn(occasion, opt.v)
                  setOccasion(next); updateUrl({ occasion: next })
                }}
                className="w-4 h-4 accent-coal-900"
              />
              <span className="text-coal-900/80 group-hover:text-coal-900">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* AI Generator CTA */}
      <Link
        href="/konfigurator"
        className="block bg-signal-100 border border-signal-500/30 p-5 hover:bg-signal-500/20 transition"
      >
        <div className="label text-signal-600 mb-2">Nie wiesz co wybrać?</div>
        <div className="text-coal-900 font-medium leading-snug mb-3">
          AI dobierze menu w 15 sekund — wpisz brief
        </div>
        <div className="text-xs text-signal-600 flex items-center gap-1.5">
          Wypróbuj <ArrowRight size={12} strokeWidth={2.5} />
        </div>
      </Link>
    </div>
  )
}
