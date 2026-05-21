"use client"
/**
 * Fires `view_item_list` once when a listing page mounts.
 * Used by /menu, /lunch, search results.
 */
import { useEffect, useRef } from "react"
import { track } from "@/lib/analytics"

export function TrackItemList({
  listId,
  listName,
  items,
}: {
  listId: string
  listName: string
  items: Array<{ id: string; title: string; price_cents: number; category?: string | null }>
}) {
  const fired = useRef(false)
  useEffect(() => {
    if (fired.current) return
    fired.current = true
    if (!items?.length) return
    track({
      event: "view_item_list",
      item_list_id: listId,
      item_list_name: listName,
      items: items.map((i) => ({
        item_id: i.id,
        item_name: i.title,
        item_category: i.category ?? undefined,
        item_brand: "Catering Śląski",
        price: i.price_cents / 100,
        quantity: 1,
      })),
    })
  }, [listId, listName, items])
  return null
}
