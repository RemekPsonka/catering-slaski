"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { ShoppingBag } from "lucide-react"
import { useCart } from "@/lib/cart-store"

export function CartBadge() {
  const [mounted, setMounted] = useState(false)
  const count = useCart((s) => s.count())

  // Hydration-safe: badge only renders after mount, so server output matches.
  useEffect(() => setMounted(true), [])

  return (
    <Link
      href="/koszyk"
      className="inline-flex items-center justify-center w-11 h-11 hover:bg-bone-200 transition relative"
      aria-label={`Koszyk${mounted && count > 0 ? ` — ${count} pozycji` : ""}`}
    >
      <ShoppingBag size={18} />
      {mounted && count > 0 && (
        <span className="absolute top-1.5 right-1.5 w-4.5 h-4.5 min-w-[18px] h-[18px] bg-signal-500 text-snow-50 text-[10px] font-bold rounded-full flex items-center justify-center num">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  )
}
