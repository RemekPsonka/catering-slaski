import Link from "next/link"
import { Repeat, Plus, Pause, Calendar, ArrowRight } from "lucide-react"

export const metadata = { title: "Subskrypcje" }

const MOCK_SUBS = [
  {
    id: "sub_001",
    name: "Lunch dnia · 5x w tygodniu",
    cadence: "Pn-Pt",
    nextDelivery: "2026-05-21",
    price_cents: 1450_00,
    period: "miesięcznie",
    active: true,
    addresses: 1,
  },
]

function formatPrice(cents: number) {
  return new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 }).format(cents / 100)
}

export default function SubscriptionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="label text-graphite-500 mb-1">Konto</div>
          <h1 className="display upper-tight font-bold text-coal-900 text-3xl lg:text-4xl">
            Subskrypcje
          </h1>
        </div>
        <Link href="/lunch" className="bg-coal-900 text-paper-100 px-5 py-3 font-semibold uppercase tracking-wide hover:bg-coal-800 flex items-center gap-2">
          <Plus size={16} /> Nowa subskrypcja
        </Link>
      </div>

      {MOCK_SUBS.length === 0 ? (
        <div className="bg-snow-50 border border-bone-200 p-12 text-center">
          <Repeat size={40} className="mx-auto mb-3 text-graphite-500" strokeWidth={1.2} />
          <h3 className="display upper-tight font-bold text-coal-900 text-xl mb-1">Brak subskrypcji</h3>
          <p className="text-coal-900/60 text-sm mb-5 max-w-sm mx-auto">
            Lunch dnia, BOX firmowy co tydzień, deser piątkowy — wszystko z rabatem -15%.
          </p>
          <Link href="/lunch" className="bg-signal-500 text-snow-50 px-6 py-3 font-semibold uppercase tracking-wide inline-flex items-center gap-2">
            Zobacz plany <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {MOCK_SUBS.map((s) => (
            <div key={s.id} className="bg-snow-50 border border-bone-200 p-6">
              <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-success-500"></span>
                    <span className="label text-success-700">Aktywna</span>
                  </div>
                  <h3 className="display upper-tight font-bold text-coal-900 text-xl">{s.name}</h3>
                  <div className="text-sm text-coal-900/60 mt-1">{s.cadence} · {s.addresses} adres</div>
                </div>
                <div className="text-right">
                  <div className="display upper font-bold text-coal-900 text-2xl num">{formatPrice(s.price_cents)}</div>
                  <div className="text-xs text-coal-900/50">/ {s.period}</div>
                </div>
              </div>

              <div className="bg-paper-100 border border-bone-200 p-4 mb-5">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar size={16} className="text-signal-500 flex-shrink-0" />
                  <div>
                    Najbliższa dostawa: <strong className="num">{s.nextDelivery}</strong> · pon 12:00-14:00
                  </div>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <button className="border border-coal-900/15 hover:bg-coal-900 hover:text-paper-100 px-4 py-2 text-sm transition">
                  Edytuj menu
                </button>
                <button className="border border-coal-900/15 hover:bg-coal-900 hover:text-paper-100 px-4 py-2 text-sm transition">
                  Adresy
                </button>
                <button className="border border-coal-900/15 hover:bg-coal-900 hover:text-paper-100 px-4 py-2 text-sm transition flex items-center gap-1.5">
                  <Pause size={13} /> Pauza
                </button>
                <button className="border border-signal-500/30 text-signal-600 hover:bg-signal-500 hover:text-snow-50 hover:border-signal-500 px-4 py-2 text-sm transition ml-auto">
                  Anuluj subskrypcję
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
