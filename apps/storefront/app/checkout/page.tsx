import { Metadata } from "next"
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow"

export const metadata: Metadata = {
  title: "Checkout",
  description: "Zamówienie krok po kroku — adres, dostawa, płatność",
}

export default function CheckoutPage() {
  return (
    <article className="bg-paper-100 min-h-[60vh]">
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
        <CheckoutFlow />
      </section>
    </article>
  )
}
