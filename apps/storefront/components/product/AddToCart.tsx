"use client"

import { useState } from "react"
import { ShoppingCart, Heart, Minus, Plus, Check } from "lucide-react"
import { useCart } from "@/lib/cart-store"
import { track } from "@/lib/analytics"

type Product = {
  slug: string
  name: string
  price_cents: number
  images: string[]
  portions?: string
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 }).format(cents / 100)
}

export function AddToCart({ product }: { product: Product }) {
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [favorite, setFavorite] = useState(false)
  const addItem = useCart((s) => s.addItem)

  const total = product.price_cents * qty

  function handleAdd() {
    addItem({
      slug: product.slug,
      name: product.name,
      price_cents: product.price_cents,
      qty,
      image: product.images[0],
    })
    track({
      event: "add_to_cart",
      currency: "PLN",
      value: (product.price_cents * qty) / 100,
      items: [
        {
          item_id: product.slug,
          item_name: product.name,
          item_brand: "Catering Śląski",
          price: product.price_cents / 100,
          quantity: qty,
        },
      ],
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2200)
  }

  return (
    <div className="space-y-5">
      {/* Price row */}
      <div className="flex items-baseline gap-4 flex-wrap">
        <div className="display upper font-bold text-coal-900 text-5xl num leading-none">
          {formatPrice(product.price_cents)}
        </div>
        <div className="text-coal-900/50 text-sm">
          netto / brutto · 8% VAT
        </div>
      </div>

      {/* Quantity + buttons */}
      <div className="flex items-stretch gap-3">
        {/* Qty stepper */}
        <div className="flex items-stretch border-2 border-coal-900">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-3 hover:bg-coal-900 hover:text-paper-100 transition"
            aria-label="Zmniejsz"
          >
            <Minus size={16} />
          </button>
          <div className="px-5 flex items-center font-bold num text-lg min-w-[3rem] justify-center">
            {qty}
          </div>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(99, q + 1))}
            className="px-3 hover:bg-coal-900 hover:text-paper-100 transition"
            aria-label="Zwiększ"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Add to cart */}
        <button
          type="button"
          onClick={handleAdd}
          className="flex-1 bg-signal-500 hover:bg-signal-600 text-snow-50 font-semibold uppercase tracking-wide px-6 py-3 flex items-center justify-center gap-3 transition"
        >
          {added ? (
            <>
              <Check size={18} /> Dodano do koszyka
            </>
          ) : (
            <>
              <ShoppingCart size={18} /> Dodaj — {formatPrice(total)}
            </>
          )}
        </button>

        {/* Favorite */}
        <button
          type="button"
          onClick={() => setFavorite((f) => !f)}
          className={`border-2 px-4 transition ${
            favorite
              ? "border-signal-500 bg-signal-500 text-snow-50"
              : "border-coal-900 hover:bg-coal-900 hover:text-paper-100"
          }`}
          aria-label="Dodaj do ulubionych"
        >
          <Heart size={20} fill={favorite ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Inline notice */}
      {added && (
        <div className="bg-success-500/10 border border-success-500/30 px-4 py-3 text-sm text-success-700 flex items-center gap-2">
          <Check size={16} className="flex-shrink-0" />
          <span>
            {qty}× <strong>{product.name}</strong> w koszyku. Możesz kontynuować zakupy.
          </span>
        </div>
      )}
    </div>
  )
}
