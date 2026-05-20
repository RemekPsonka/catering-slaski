"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export type CartItem = {
  slug: string
  name: string
  price_cents: number
  qty: number
  image?: string
  note?: string
}

type CartState = {
  items: CartItem[]
  // Computed
  count: () => number
  subtotalCents: () => number
  // Actions
  addItem: (item: CartItem) => void
  removeItem: (slug: string) => void
  updateQty: (slug: string, qty: number) => void
  setNote: (slug: string, note: string) => void
  clear: () => void
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      count: () => get().items.reduce((sum, i) => sum + i.qty, 0),
      subtotalCents: () => get().items.reduce((sum, i) => sum + i.qty * i.price_cents, 0),
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.slug === item.slug)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.slug === item.slug ? { ...i, qty: Math.min(99, i.qty + item.qty) } : i
              ),
            }
          }
          return { items: [...state.items, item] }
        }),
      removeItem: (slug) => set((state) => ({ items: state.items.filter((i) => i.slug !== slug) })),
      updateQty: (slug, qty) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.slug === slug ? { ...i, qty: Math.max(0, qty) } : i))
            .filter((i) => i.qty > 0),
        })),
      setNote: (slug, note) =>
        set((state) => ({
          items: state.items.map((i) => (i.slug === slug ? { ...i, note } : i)),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "cs-cart-v1",
      storage: createJSONStorage(() => localStorage),
    }
  )
)
