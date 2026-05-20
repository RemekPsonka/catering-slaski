import Link from "next/link"
import { ArrowLeft, Package, MapPin, Calendar, Truck, Download, RotateCcw, Check, Clock } from "lucide-react"

export const metadata = { title: "Zamówienie" }

type Params = Promise<{ id: string }>

// TODO: fetch from Medusa after deploy
async function getOrder(id: string) {
  return {
    id,
    date: "2026-05-22",
    slot: "12:00-14:00",
    status: "W produkcji",
    items: [
      { name: "BOX koktajlowy II", qty: 1, price_cents: 340_00 },
      { name: "Patera kanapek koktajlowych", qty: 2, price_cents: 290_00 },
    ],
    address: { street: "Mariacka 12 / 5", city: "Katowice", postcode: "40-014", phone: "+48 600 123 456" },
    payment: "BLIK",
    delivery_cents: 19_00,
    subtotal_cents: 920_00,
    total_cents: 939_00,
    courier: "Andrzej K. · +48 700 800 900",
    timeline: [
      { t: "2026-05-20 10:14", event: "Zamówienie złożone",        done: true },
      { t: "2026-05-20 10:14", event: "Płatność potwierdzona",     done: true },
      { t: "2026-05-21 14:00", event: "W produkcji",               done: true },
      { t: "2026-05-22 08:00", event: "Wysyłka",                   done: false },
      { t: "2026-05-22 12:00", event: "Kurier w drodze",           done: false },
      { t: "2026-05-22 13:00", event: "Dostarczone",               done: false },
    ],
  }
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 }).format(cents / 100)
}

export default async function OrderDetailPage({ params }: { params: Params }) {
  const { id } = await params
  const o = await getOrder(id)

  return (
    <div className="space-y-6">
      <Link href="/konto/zamowienia" className="inline-flex items-center gap-1 text-sm text-coal-900/60 hover:text-signal-500">
        <ArrowLeft size={14} /> Wszystkie zamówienia
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="label text-graphite-500 mb-1">Zamówienie</div>
          <h1 className="display upper-tight font-bold text-coal-900 text-3xl lg:text-4xl font-mono num">
            {o.id}
          </h1>
        </div>
        <div className="flex gap-2">
          <button className="border border-coal-900/15 hover:bg-coal-900 hover:text-paper-100 px-4 py-2.5 text-sm transition flex items-center gap-1.5">
            <Download size={14} /> Faktura
          </button>
          <button className="bg-coal-900 text-paper-100 hover:bg-coal-800 px-4 py-2.5 text-sm font-semibold uppercase tracking-wide flex items-center gap-1.5">
            <RotateCcw size={14} /> Zamów ponownie
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-snow-50 border border-bone-200 p-6">
        <h3 className="display upper-tight font-bold text-coal-900 text-lg mb-5">Status</h3>
        <ol className="space-y-3">
          {o.timeline.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <div
                className={`w-6 h-6 flex items-center justify-center flex-shrink-0 ${
                  step.done ? "bg-success-500 text-snow-50" : "bg-coal-900/10 text-coal-900/30"
                }`}
              >
                {step.done ? <Check size={14} /> : <Clock size={12} />}
              </div>
              <div className="flex-1">
                <div className={step.done ? "text-coal-900" : "text-coal-900/40"}>{step.event}</div>
                <div className="text-xs text-coal-900/40 num">{step.t}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Items */}
        <div className="lg:col-span-2 bg-snow-50 border border-bone-200 p-6">
          <h3 className="display upper-tight font-bold text-coal-900 text-lg mb-4 flex items-center gap-2">
            <Package size={18} className="text-signal-500" /> Pozycje
          </h3>
          <div className="space-y-3 divide-y divide-bone-200">
            {o.items.map((item, i) => (
              <div key={i} className={`flex items-center gap-4 ${i > 0 ? "pt-3" : ""}`}>
                <div className="flex-1">
                  <div className="text-coal-900 font-medium">{item.name}</div>
                  <div className="text-xs text-coal-900/50 num">{item.qty}× {formatPrice(item.price_cents)}</div>
                </div>
                <div className="num font-bold text-coal-900">
                  {formatPrice(item.qty * item.price_cents)}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-5 border-t border-bone-200 space-y-1.5 text-sm">
            <div className="flex justify-between text-coal-900/70">
              <span>Wartość pozycji</span>
              <span className="num">{formatPrice(o.subtotal_cents)}</span>
            </div>
            <div className="flex justify-between text-coal-900/70">
              <span>Dostawa</span>
              <span className="num">{formatPrice(o.delivery_cents)}</span>
            </div>
            <div className="flex justify-between font-bold display upper text-coal-900 text-lg pt-2 border-t border-coal-900/10 mt-2">
              <span>Razem</span>
              <span className="num">{formatPrice(o.total_cents)}</span>
            </div>
          </div>
        </div>

        {/* Side */}
        <div className="space-y-3">
          <div className="bg-snow-50 border border-bone-200 p-5">
            <h4 className="label text-graphite-500 mb-3 flex items-center gap-2"><Calendar size={14} /> Termin</h4>
            <div className="font-medium text-coal-900 num">{o.date}</div>
            <div className="text-sm text-coal-900/70 num">{o.slot}</div>
          </div>

          <div className="bg-snow-50 border border-bone-200 p-5">
            <h4 className="label text-graphite-500 mb-3 flex items-center gap-2"><MapPin size={14} /> Adres</h4>
            <div className="text-sm text-coal-900">{o.address.street}</div>
            <div className="text-sm text-coal-900/70 num">{o.address.postcode} {o.address.city}</div>
            <div className="text-sm text-coal-900/70 num">{o.address.phone}</div>
          </div>

          <div className="bg-snow-50 border border-bone-200 p-5">
            <h4 className="label text-graphite-500 mb-3 flex items-center gap-2"><Truck size={14} /> Kurier</h4>
            <div className="text-sm text-coal-900 num">{o.courier}</div>
          </div>

          <div className="bg-snow-50 border border-bone-200 p-5">
            <h4 className="label text-graphite-500 mb-2">Płatność</h4>
            <div className="text-sm text-coal-900">{o.payment}</div>
            <div className="text-xs text-success-700 mt-1">✓ Opłacone</div>
          </div>
        </div>
      </div>
    </div>
  )
}
