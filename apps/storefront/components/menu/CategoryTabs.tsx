"use client"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

const CATEGORIES = [
  { slug: "all",            label: "Wszystko",           count: 216 },
  { slug: "catering-boxes", label: "Catering BOX",       count: 48 },
  { slug: "finger-food",    label: "Finger food",        count: 32 },
  { slug: "zimna-plyta",    label: "Zimna płyta",        count: 18 },
  { slug: "komunia",        label: "Komunia 2026",       count: 24 },
  { slug: "street",         label: "Burgery / Hot dogi", count: 12 },
  { slug: "desery",         label: "Desery",             count: 28 },
  { slug: "lunch",          label: "Lunch dnia",         count: 8 },
  { slug: "garmazerka",     label: "Garmażerka",         count: 46 },
]

export function CategoryTabs() {
  const params = useSearchParams()
  const active = params.get("cat") || "all"

  return (
    <section className="border-b border-coal-900/10 bg-paper-100 sticky top-[73px] z-30">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1" style={{ scrollbarWidth: "none" }}>
          {CATEGORIES.map((c) => {
            const isActive = active === c.slug
            return (
              <Link
                key={c.slug}
                href={c.slug === "all" ? "/menu" : `/menu?cat=${c.slug}`}
                className={`flex-shrink-0 px-5 py-2 text-sm font-medium border transition whitespace-nowrap ${
                  isActive
                    ? "bg-coal-900 text-paper-100 border-coal-900"
                    : "border-coal-900/15 hover:bg-coal-900 hover:text-paper-100"
                }`}
              >
                {c.label}{" "}
                <span className={`ml-1 num ${isActive ? "opacity-70" : "opacity-60"}`}>({c.count})</span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
