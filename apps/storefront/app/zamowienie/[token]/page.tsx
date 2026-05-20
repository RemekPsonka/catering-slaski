import { notFound } from "next/navigation"
import { Check, Clock, Package, MapPin, Truck, ChefHat } from "lucide-react"
import Link from "next/link"

export const metadata = { title: "Status zamówienia" }

type Params = Promise<{ token: string }>

// Publiczny tracking — token URL-safe, daje 30 dni dostępu read-only.
// Nie wymaga logowania. Wysyłany w SMS + email.
async function getOrderByToken(token: string) {
  // TODO: GET /store/orders/by-tracking-token z Medusa po deploy
  // Na razie mock dla 1 widocznego flow:
  if (token.length < 8) return null

  return {
    id: "CS-2026-43308",
    status: "in_production",
    placed_at: "2026-05-20T10:14:00Z",
    delivery_date: "2026-05-22",
    delivery_slot: "12:00-14:00",
    address: "Mariacka 12 / 5, 40-014 Katowice",
    items: [
      { name: "BOX koktajlowy II", qty: 1, price_cents: 34000 },
      { name: "Patera kanapek koktajlowych", qty: 2, price_cents: 29000 },
    ],
    total_cents: 93900,
    courier: null as { name: string; phone: string; eta_minutes?: number } | null,
    timeline: [
      { stage: "placed", label: "Zamówienie złożone", time: "2026-05-20 10:14", done: true },
      { stage: "paid", label: "Płatność potwierdzona", time: "2026-05-20 10:14", done: true },
      { stage: "in_production", label: "W produkcji", time: "2026-05-21 14:00", done: true },
      { stage: "ready_to_dispatch", label: "Gotowe do wysyłki", time: null, done: false },
      { stage: "on_the_way", label: "Kurier w drodze", time: null, done: false },
      { stage: "delivered", label: "Dostarczone", time: null, done: false },
    ],
  }
}

const STAGE_ICONS: Record<string, any> = {
  placed: Package,
  paid: Check,
  in_production: ChefHat,
  ready_to_dispatch: Package,
  on_the_way: Truck,
  delivered: MapPin,
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 }).format(cents / 100)
}

export default async function OrderTrackingPage({ params }: { params: Params }) {
  const { token } = await params
  const order = await getOrderByToken(token)
  if (!order) notFound()

  const currentStage = order.timeline.findIndex((t) => !t.done)
  const activeStage = currentStage === -1 ? order.timeline.length - 1 : currentStage - 1
  const progressPct = Math.round(((activeStage + 1) / order.timeline.length) * 100)

  return (
    <article className="bg-paper-100 min-h-screen">
      <section className="max-w-3xl mx-auto px-6 lg:px-10 py-12">
        <Link href="/" className="text-sm text-coal-900/60 hover:text-signal-500 inline-flex items-center gap-1 mb-6">
          ← Strona główna
        </Link>

        <div className="bg-coal-900 text-paper-100 p-8 lg:p-10">
          <div className="label text-signal-500 mb-2">Tracking publiczny</div>
          <div className="display upper-tight font-bold text-2xl lg:text-3xl mb-1 font-mono num">{order.id}</div>
          <div className="text-sm text-paper-100/70 num">
            Dostawa: <strong>{order.delivery_date} · {order.delivery_slot}</strong>
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-xs text-paper-100/60 mb-2">
              <span>Postęp</span>
              <span className="num">{progressPct}%</span>
            </div>
            <div className="bg-coal-800 h-2 overflow-hidden">
              <div className="bg-signal-500 h-full transition-all" style={{ width: `${progressPct}%` }}></div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-snow-50 border border-bone-200 p-6 lg:p-8 mt-4">
          <h2 className="display upper-tight font-bold text-coal-900 text-xl mb-5">Status</h2>
          <ol className="relative">
            <div className="absolute left-4 top-2 bottom-2 w-px bg-coal-900/20"></div>
            {order.timeline.map((step) => {
              const Icon = STAGE_ICONS[step.stage] ?? Clock
              return (
                <li key={step.stage} className="flex items-start gap-4 relative pb-4 last:pb-0">
                  <div
                    className={`w-9 h-9 flex items-center justify-center flex-shrink-0 relative z-10 ${
                      step.done ? "bg-success-500 text-snow-50" : "bg-coal-900/10 text-coal-900/40"
                    }`}
                  >
                    {step.done ? <Check size={16} strokeWidth={3} /> : <Icon size={16} />}
                  </div>
                  <div className="flex-1 pt-1.5">
                    <div className={`font-medium ${step.done ? "text-coal-900" : "text-coal-900/40"}`}>
                      {step.label}
                    </div>
                    {step.time && <div className="text-xs text-coal-900/50 num">{step.time}</div>}
                  </div>
                </li>
              )
            })}
          </ol>
        </div>

        {/* Courier card — visible only when "on the way" */}
        {order.courier && (
          <div className="bg-signal-500 text-snow-50 p-6 mt-4">
            <div className="label opacity-80 mb-2">Twój kurier</div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="display upper-tight font-bold text-xl">{order.courier.name}</div>
                <a href={`tel:${order.courier.phone}`} className="text-sm text-snow-50/90 num underline">
                  {order.courier.phone}
                </a>
              </div>
              {order.courier.eta_minutes !== undefined && (
                <div className="text-right">
                  <div className="display upper font-bold text-3xl num">{order.courier.eta_minutes}</div>
                  <div className="text-xs uppercase tracking-widest opacity-80">min do Ciebie</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Order summary */}
        <div className="bg-snow-50 border border-bone-200 p-6 mt-4">
          <h3 className="label text-graphite-500 mb-3">Pozycje ({order.items.length})</h3>
          <div className="divide-y divide-bone-200">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2.5">
                <div className="flex-1">
                  <div className="text-coal-900 font-medium text-sm">{item.name}</div>
                  <div className="text-xs text-coal-900/50 num">{item.qty}× {formatPrice(item.price_cents)}</div>
                </div>
                <div className="num text-coal-900 font-medium">{formatPrice(item.qty * item.price_cents)}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-coal-900/10 flex justify-between display upper font-bold text-coal-900">
            <span>Razem</span>
            <span className="num">{formatPrice(order.total_cents)}</span>
          </div>
        </div>

        {/* Address */}
        <div className="bg-snow-50 border border-bone-200 p-6 mt-4">
          <h3 className="label text-graphite-500 mb-2 flex items-center gap-2">
            <MapPin size={14} /> Adres dostawy
          </h3>
          <div className="text-coal-900">{order.address}</div>
        </div>

        {/* Support */}
        <div className="text-center text-sm text-coal-900/60 mt-8">
          Coś nie tak? Zadzwoń: <a href="tel:+48793001900" className="text-signal-500 font-medium num">+48 793 001 900</a>
        </div>
      </section>
    </article>
  )
}
