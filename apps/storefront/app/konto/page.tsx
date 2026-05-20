import Link from "next/link"
import { Package, Repeat, Award, ArrowRight, Truck, Clock, Calendar } from "lucide-react"

export const metadata = { title: "Moje konto" }

const MOCK_RECENT = [
  { id: "CS-2026-43221", date: "2026-05-15", total: 580_00, status: "Dostarczone", items: 2 },
  { id: "CS-2026-43102", date: "2026-04-28", total: 1280_00, status: "Dostarczone", items: 5 },
]

const MOCK_NEXT = {
  id: "CS-2026-43308",
  date: "2026-05-22",
  slot: "12:00-14:00",
  items: 3,
  status: "W produkcji",
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 }).format(cents / 100)
}

export default function AccountOverview() {
  return (
    <div className="space-y-6">
      <div>
        <div className="label text-graphite-500 mb-1">Witaj ponownie</div>
        <h1 className="display upper-tight font-bold text-coal-900 text-3xl lg:text-4xl">
          Remigiusz
        </h1>
      </div>

      {/* Next delivery */}
      <div className="bg-coal-900 text-paper-100 p-6 lg:p-8">
        <div className="flex items-start justify-between mb-5 gap-4 flex-wrap">
          <div>
            <div className="label text-signal-500 mb-1">Najbliższa dostawa</div>
            <div className="display upper-tight font-bold text-2xl lg:text-3xl">
              {MOCK_NEXT.date} · {MOCK_NEXT.slot}
            </div>
            <div className="text-sm text-paper-100/70 mt-1">
              Zamówienie <span className="font-mono num">{MOCK_NEXT.id}</span> · {MOCK_NEXT.items} pozycje
            </div>
          </div>
          <div className="text-xs uppercase tracking-widest bg-signal-500 text-snow-50 px-3 py-1.5">
            ● {MOCK_NEXT.status}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-coal-800 border border-paper-100/10 p-3 text-center">
            <Calendar size={18} className="mx-auto mb-1 text-signal-500" />
            <div className="text-[10px] uppercase tracking-widest text-paper-100/50">Termin</div>
            <div className="text-sm font-medium">Piątek</div>
          </div>
          <div className="bg-coal-800 border border-paper-100/10 p-3 text-center">
            <Truck size={18} className="mx-auto mb-1 text-signal-500" />
            <div className="text-[10px] uppercase tracking-widest text-paper-100/50">Kurier</div>
            <div className="text-sm font-medium">Andrzej K.</div>
          </div>
          <div className="bg-coal-800 border border-paper-100/10 p-3 text-center">
            <Clock size={18} className="mx-auto mb-1 text-signal-500" />
            <div className="text-[10px] uppercase tracking-widest text-paper-100/50">SMS</div>
            <div className="text-sm font-medium">24h przed</div>
          </div>
        </div>
        <Link
          href={`/konto/zamowienia/${MOCK_NEXT.id}`}
          className="inline-flex items-center gap-2 text-sm text-signal-500 hover:text-signal-400"
        >
          Szczegóły zamówienia <ArrowRight size={14} />
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Zamówienia", value: "23", icon: Package, link: "/konto/zamowienia" },
          { label: "Punkty lojalności", value: "1240", icon: Award, link: "/konto/lojalnosc" },
          { label: "Aktywne subskrypcje", value: "1", icon: Repeat, link: "/konto/subskrypcje" },
          { label: "Wydane łącznie", value: "12 480 zł", icon: ArrowRight, link: "/konto/zamowienia" },
        ].map((s) => (
          <Link
            key={s.label}
            href={s.link}
            className="bg-snow-50 border border-bone-200 p-5 hover:border-signal-500 transition group"
          >
            <s.icon size={18} className="text-signal-500 mb-2" strokeWidth={1.8} />
            <div className="display upper font-bold text-coal-900 text-2xl num">{s.value}</div>
            <div className="text-xs text-coal-900/60 mt-0.5">{s.label}</div>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-snow-50 border border-bone-200">
        <div className="px-5 py-4 border-b border-bone-200 flex items-center justify-between">
          <h3 className="display upper-tight font-bold text-coal-900">Ostatnie zamówienia</h3>
          <Link href="/konto/zamowienia" className="text-sm text-signal-500 hover:text-signal-600">
            Wszystkie →
          </Link>
        </div>
        <div className="divide-y divide-bone-200">
          {MOCK_RECENT.map((o) => (
            <Link
              key={o.id}
              href={`/konto/zamowienia/${o.id}`}
              className="px-5 py-4 flex items-center gap-4 hover:bg-paper-100 transition"
            >
              <div className="w-10 h-10 bg-bone-200 flex items-center justify-center flex-shrink-0">
                <Package size={18} className="text-coal-900/60" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-mono text-sm text-coal-900 num">{o.id}</div>
                <div className="text-xs text-coal-900/50 num">{o.date} · {o.items} pozycje</div>
              </div>
              <div className="text-right">
                <div className="display upper font-bold num text-sm">{formatPrice(o.total)}</div>
                <div className="text-xs text-success-700">{o.status}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Loyalty teaser */}
      <Link
        href="/konto/lojalnosc"
        className="block bg-signal-100 border border-signal-500/30 p-6 hover:bg-signal-500/10 transition"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-signal-500 flex items-center justify-center flex-shrink-0">
            <Award size={28} className="text-snow-50" strokeWidth={1.8} />
          </div>
          <div className="flex-1">
            <div className="label text-signal-600 mb-1">Status Srebrny · 1240 pkt</div>
            <div className="display upper-tight font-bold text-coal-900 text-lg">
              260 pkt do statusu Złotego
            </div>
            <div className="w-full bg-coal-900/10 h-1.5 mt-3 overflow-hidden">
              <div className="bg-signal-500 h-full" style={{ width: "82%" }}></div>
            </div>
          </div>
          <ArrowRight size={20} className="text-signal-500" />
        </div>
      </Link>
    </div>
  )
}
