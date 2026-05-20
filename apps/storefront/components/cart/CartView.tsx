"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, Sparkles, Truck, Tag } from "lucide-react"
import { useCart } from "@/lib/cart-store"

function formatPrice(cents: number) {
  return new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 }).format(cents / 100)
}

export function CartView() {
  const [mounted, setMounted] = useState(false)
  const [promoCode, setPromoCode] = useState("")
  const [promoApplied, setPromoApplied] = useState<{ code: string; discount: number } | null>(null)

  const items = useCart((s) => s.items)
  const updateQty = useCart((s) => s.updateQty)
  const removeItem = useCart((s) => s.removeItem)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className="text-coal-900/50">Ładowanie koszyka…</div>
  }

  if (items.length === 0) {
    return (
      <div className="bg-snow-50 border border-bone-200 p-12 text-center">
        <ShoppingBag size={48} className="mx-auto mb-4 text-graphite-500" strokeWidth={1.2} />
        <h2 className="display upper-tight font-bold text-coal-900 text-2xl mb-2">
          Koszyk jest pusty
        </h2>
        <p className="text-coal-900/60 mb-6">
          Zacznij od przejrzenia menu lub wygeneruj propozycję z AI.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/menu"
            className="bg-coal-900 text-paper-100 font-semibold uppercase tracking-wide px-6 py-3 hover:bg-coal-800 transition inline-flex items-center gap-2"
          >
            Otwórz menu <ArrowRight size={16} />
          </Link>
          <Link
            href="/konfigurator"
            className="border-2 border-coal-900 text-coal-900 font-semibold uppercase tracking-wide px-6 py-3 hover:bg-coal-900 hover:text-paper-100 transition inline-flex items-center gap-2"
          >
            <Sparkles size={16} /> AI Generator
          </Link>
        </div>
      </div>
    )
  }

  const subtotal = items.reduce((sum, i) => sum + i.qty * i.price_cents, 0)
  const discount = promoApplied ? Math.round(subtotal * promoApplied.discount) : 0
  const delivery = 2900 // 29 zł placeholder until zone lookup
  const total = subtotal - discount + delivery

  function applyPromo() {
    const code = promoCode.trim().toUpperCase()
    if (code === "NOWY10") setPromoApplied({ code, discount: 0.10 })
    else if (code === "WIOSNA15") setPromoApplied({ code, discount: 0.15 })
    else setPromoApplied(null)
  }

  return (
    <div className="grid lg:grid-cols-12 gap-8">
      {/* Items */}
      <div className="lg:col-span-8 space-y-3">
        {items.map((item) => (
          <div key={item.slug} className="bg-snow-50 border border-bone-200 p-4 lg:p-5 flex gap-4">
            <div className="relative w-24 h-24 lg:w-32 lg:h-32 flex-shrink-0 bg-bone-200 overflow-hidden">
              {item.image && (
                <Image src={item.image} alt={item.name} fill sizes="128px" className="object-cover" />
              )}
            </div>
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between gap-3 mb-2">
                <Link href={`/produkt/${item.slug}`} className="display upper-tight font-bold text-coal-900 text-base lg:text-lg hover:text-signal-500 leading-tight">
                  {item.name}
                </Link>
                <button
                  onClick={() => removeItem(item.slug)}
                  className="text-coal-900/40 hover:text-signal-500 flex-shrink-0"
                  aria-label="Usuń"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="text-xs text-coal-900/50 mb-3 num">
                {formatPrice(item.price_cents)} / szt.
              </div>
              <div className="mt-auto flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-stretch border border-coal-900">
                  <button
                    onClick={() => updateQty(item.slug, item.qty - 1)}
                    className="px-2.5 hover:bg-coal-900 hover:text-paper-100 transition"
                    aria-label="Zmniejsz"
                  >
                    <Minus size={14} />
                  </button>
                  <div className="px-4 flex items-center font-bold num text-sm min-w-[2.5rem] justify-center">
                    {item.qty}
                  </div>
                  <button
                    onClick={() => updateQty(item.slug, item.qty + 1)}
                    className="px-2.5 hover:bg-coal-900 hover:text-paper-100 transition"
                    aria-label="Zwiększ"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div className="display upper font-bold text-coal-900 num">
                  {formatPrice(item.qty * item.price_cents)}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Promo code */}
        <div className="bg-snow-50 border border-bone-200 p-5">
          <div className="label text-coal-900 mb-3 flex items-center gap-2">
            <Tag size={14} /> Kod rabatowy
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="np. NOWY10"
              className="flex-1 border border-coal-900/20 px-3 py-2.5 text-sm bg-paper-100 focus:outline-none focus:border-coal-900"
            />
            <button
              onClick={applyPromo}
              className="bg-coal-900 text-paper-100 px-5 text-sm font-semibold uppercase tracking-wide hover:bg-coal-800"
            >
              Aktywuj
            </button>
          </div>
          {promoApplied && (
            <div className="mt-3 text-xs text-success-700">
              ✓ Kod <strong className="num">{promoApplied.code}</strong> aktywny — rabat {(promoApplied.discount * 100).toFixed(0)}%
            </div>
          )}
        </div>

        {/* AI upsell */}
        <Link
          href="/konfigurator"
          className="block bg-signal-100 border border-signal-500/30 p-5 hover:bg-signal-500/10 transition"
        >
          <div className="flex items-center gap-3">
            <Sparkles size={20} className="text-signal-500 flex-shrink-0" />
            <div className="flex-1">
              <div className="label text-signal-600 mb-0.5">Sugestia AI</div>
              <p className="text-sm text-coal-900/80">
                Twój koszyk wygląda na imprezę dla 12+ osób. AI może dorzucić deser i napoje — sprawdź propozycję.
              </p>
            </div>
            <ArrowRight size={16} className="text-signal-500" />
          </div>
        </Link>
      </div>

      {/* Summary */}
      <div className="lg:col-span-4">
        <div className="bg-snow-50 border border-bone-200 p-6 lg:sticky lg:top-32">
          <h3 className="display upper-tight font-bold text-coal-900 text-xl mb-5">
            Podsumowanie
          </h3>
          <div className="space-y-2.5 text-sm mb-5 pb-5 border-b border-coal-900/10">
            <div className="flex justify-between">
              <span className="text-coal-900/70">Wartość ({items.length} {items.length === 1 ? "pozycja" : "pozycje"})</span>
              <span className="num">{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-success-700">
                <span>Rabat {promoApplied?.code}</span>
                <span className="num">-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-coal-900/70 inline-flex items-center gap-1.5">
                <Truck size={13} /> Dostawa
              </span>
              <span className="num">{formatPrice(delivery)}</span>
            </div>
          </div>
          <div className="flex justify-between items-baseline mb-6">
            <span className="display upper-tight font-bold text-coal-900">Razem</span>
            <span className="display upper font-bold text-coal-900 num text-3xl">
              {formatPrice(total)}
            </span>
          </div>
          <Link
            href="/checkout"
            className="block w-full bg-signal-500 hover:bg-signal-600 text-snow-50 font-semibold uppercase tracking-wide py-4 text-center transition"
          >
            Przejdź do checkout →
          </Link>
          <p className="text-center text-xs text-graphite-500 mt-3 label">
            BLIK · Karta · Apple Pay · Faktura B2B
          </p>
        </div>
      </div>
    </div>
  )
}
