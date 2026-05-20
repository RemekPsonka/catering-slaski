import { Metadata } from "next"
import { CartView } from "@/components/cart/CartView"

export const metadata: Metadata = {
  title: "Koszyk",
  description: "Twoje BOXy gotowe do zamówienia",
}

export default function CartPage() {
  return (
    <article className="bg-paper-100 min-h-[60vh]">
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-10 lg:py-16">
        <div className="mb-10">
          <div className="label text-graphite-500 mb-2">Krok 1 z 3</div>
          <h1 className="display upper-tight font-bold text-coal-900 text-4xl lg:text-5xl">
            Twój koszyk
          </h1>
        </div>
        <CartView />
      </section>
    </article>
  )
}
