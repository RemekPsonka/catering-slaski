import { MapPin, Plus, Edit2, Trash2, Star } from "lucide-react"

export const metadata = { title: "Adresy" }

const MOCK_ADDRESSES = [
  {
    id: "1",
    label: "Dom",
    street: "Mariacka 12 / 5",
    city: "Katowice",
    postcode: "40-014",
    phone: "+48 600 123 456",
    isDefault: true,
    zone: "Lokalna · 19 zł",
  },
  {
    id: "2",
    label: "Biuro",
    street: "Roździeńskiego 188",
    city: "Katowice",
    postcode: "40-203",
    phone: "+48 32 700 80 00",
    isDefault: false,
    zone: "Lokalna · 19 zł",
  },
]

export default function AddressesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="label text-graphite-500 mb-1">Konto</div>
          <h1 className="display upper-tight font-bold text-coal-900 text-3xl lg:text-4xl">
            Adresy
          </h1>
        </div>
        <button className="bg-coal-900 text-paper-100 px-5 py-3 font-semibold uppercase tracking-wide hover:bg-coal-800 flex items-center gap-2">
          <Plus size={16} /> Nowy adres
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {MOCK_ADDRESSES.map((a) => (
          <div key={a.id} className="bg-snow-50 border border-bone-200 p-5 relative">
            {a.isDefault && (
              <span className="absolute top-3 right-3 text-[10px] uppercase tracking-widest font-semibold bg-signal-500 text-snow-50 px-2 py-0.5 flex items-center gap-1">
                <Star size={10} fill="currentColor" /> Domyślny
              </span>
            )}
            <div className="flex items-start gap-3 mb-4">
              <MapPin size={20} className="text-signal-500 flex-shrink-0 mt-0.5" strokeWidth={1.8} />
              <div>
                <div className="label text-graphite-500 mb-1">{a.label}</div>
                <div className="font-medium text-coal-900">{a.street}</div>
                <div className="text-coal-900/70 text-sm num">{a.postcode} {a.city}</div>
                <div className="text-coal-900/70 text-sm num mt-1">{a.phone}</div>
              </div>
            </div>
            <div className="text-xs text-coal-900/50 mb-4 num">
              Strefa: <span className="text-coal-900/80">{a.zone}</span>
            </div>
            <div className="flex gap-2 pt-3 border-t border-bone-200">
              <button className="flex-1 border border-coal-900/15 hover:bg-coal-900 hover:text-paper-100 py-2 text-sm transition flex items-center justify-center gap-1.5">
                <Edit2 size={14} /> Edytuj
              </button>
              {!a.isDefault && (
                <button className="border border-coal-900/15 hover:bg-coal-900 hover:text-paper-100 px-3 transition" title="Ustaw jako domyślny">
                  <Star size={14} />
                </button>
              )}
              <button className="border border-coal-900/15 hover:bg-signal-500 hover:text-snow-50 hover:border-signal-500 px-3 transition" title="Usuń">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
