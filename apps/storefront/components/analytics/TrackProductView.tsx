"use client"
/**
 * Fires GA4 `view_item` once when the PDP mounts.
 * Server component-friendly: takes plain props, no Product type leak.
 */
import { useEffect, useRef } from "react"
import { track } from "@/lib/analytics"

export function TrackProductView({
  productId,
  title,
  priceCents,
  category,
}: {
  productId: string
  title: string
  priceCents: number
  category?: string | null
}) {
  const fired = useRef(false)
  useEffect(() => {
    if (fired.current) return
    fired.current = true
    const value = priceCents / 100
    track({
      event: "view_item",
      currency: "PLN",
      value,
      items: [
        {
          item_id: productId,
          item_name: title,
          item_category: category ?? undefined,
          item_brand: "Catering Śląski",
          price: value,
          quantity: 1,
        },
      ],
    })
  }, [productId, title, priceCents, category])
  return null
}
