import Link from "next/link"
import { Package, Download, RotateCcw } from "lucide-react"

export const metadata = { title: "Zamówienia" }

const MOCK_ORDERS = [
  { id: "CS-2026-43308", date: "2026-05-22", total: 980_00, items: 3, status: "W produkcji",  statusCls: "bg-warning-500/20 text-warning-700" },
  { id: "CS-2026-43221", date: "2026-05-15", total: 580_00, items: 2, status: "Dostarczone",  statusCls: "bg-success-500/15 text-success-700" },
  { id: "CS-2026-43102", date: "2026-04-28", total: 1280_00, items: 5, status: "Dostarczone", statusCls: "bg-success-500/15 text-success-700" },
  { id: "CS-2026-42891", date: "2026-04-12", total: 340_00, items: 1, status: "Dostarczone",  statusCls: "bg-success-500/15 text-success-700" },
  { id: "CS-2026-42704", date: "2026-03-30", total: 2240_00, items: 8, status: "Dostarczone", statusCls: "bg-success-500/15 text-success-700" },
  { id: "CS-2026-42551", date: "2026-03-17", total: 760_00, items: 3, status: "Anulowane",    statusCls: "bg-coal-900/10 text-coal-900/60" },
]

function formatPrice(cents: number) {
  return new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 }).format(cents / 100)
}

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="label text-graphite-500 mb-1">Konto</div>
        <h1 className="display upper-tight font-bold text-coal-900 text-3xl lg:text-4xl">
          Zamówienia
        </h1>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["Wszystkie", "W produkcji", "Dostarczone", "Anulowane"].map((f, i) => (
          <button
            key={f}
            className={`px-4 py-2 text-sm border ${
              i === 0
                ? "bg-coal-900 text-paper-100 border-coal-900"
                : "border-coal-900/15 hover:bg-coal-900 hover:text-paper-100"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Orders list */}
      <div className="bg-snow-50 border border-bone-200">
        {MOCK_ORDERS.map((o, i) => (
          <div
            key={o.id}
            className={`p-5 ${i < MOCK_ORDERS.length - 1 ? "border-b border-bone-200" : ""} flex items-center gap-4 flex-wrap`}
          >
            <div className="w-10 h-10 bg-bone-200 flex items-center justify-center flex-shrink-0">
              <Package size={18} className="text-coal-900/60" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <Link
                  href={`/konto/zamowienia/${o.id}`}
                  className="font-mono text-sm text-coal-900 hover:text-signal-500 num"
                >
                  {o.id}
                </Link>
                <span className={`text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 ${o.statusCls}`}>
                  ● {o.status}
                </span>
              </div>
              <div className="text-xs text-coal-900/50 num">
                {o.date} · {o.items} pozycje
              </div>
            </div>
            <div className="text-right">
              <div className="display upper font-bold num text-coal-900">{formatPrice(o.total)}</div>
            </div>
            <div className="flex gap-2">
              <button className="border border-coal-900/15 hover:bg-coal-900 hover:text-paper-100 p-2 transition" title="Pobierz fakturę">
                <Download size={14} />
              </button>
              <button className="border border-coal-900/15 hover:bg-coal-900 hover:text-paper-100 p-2 transition" title="Zamów ponownie">
                <RotateCcw size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
