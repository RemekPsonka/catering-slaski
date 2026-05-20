import { Settings, Bell, Shield, Trash2 } from "lucide-react"

export const metadata = { title: "Ustawienia" }

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="label text-graphite-500 mb-1">Konto</div>
        <h1 className="display upper-tight font-bold text-coal-900 text-3xl lg:text-4xl">
          Ustawienia
        </h1>
      </div>

      {/* Profile */}
      <div className="bg-snow-50 border border-bone-200 p-6">
        <h3 className="display upper-tight font-bold text-coal-900 text-lg mb-5 flex items-center gap-2">
          <Settings size={18} className="text-signal-500" /> Profil
        </h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="label text-coal-900/70 mb-1.5 block">Imię</label>
            <input
              defaultValue="Remigiusz"
              className="w-full border border-coal-900/20 px-3 py-2.5 bg-paper-100 focus:outline-none focus:border-coal-900"
            />
          </div>
          <div>
            <label className="label text-coal-900/70 mb-1.5 block">Nazwisko</label>
            <input
              defaultValue="Psonka"
              className="w-full border border-coal-900/20 px-3 py-2.5 bg-paper-100 focus:outline-none focus:border-coal-900"
            />
          </div>
          <div>
            <label className="label text-coal-900/70 mb-1.5 block">Email</label>
            <input
              defaultValue="remek@ideecom.pl"
              className="w-full border border-coal-900/20 px-3 py-2.5 bg-paper-100 focus:outline-none focus:border-coal-900"
            />
          </div>
          <div>
            <label className="label text-coal-900/70 mb-1.5 block">Telefon</label>
            <input
              defaultValue="+48 600 123 456"
              className="w-full border border-coal-900/20 px-3 py-2.5 bg-paper-100 focus:outline-none focus:border-coal-900 num"
            />
          </div>
        </div>
        <button className="bg-coal-900 text-paper-100 px-5 py-2.5 font-semibold uppercase tracking-wide hover:bg-coal-800">
          Zapisz zmiany
        </button>
      </div>

      {/* B2B */}
      <div className="bg-snow-50 border border-bone-200 p-6">
        <h3 className="display upper-tight font-bold text-coal-900 text-lg mb-5">Dane do faktur (B2B)</h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="label text-coal-900/70 mb-1.5 block">Nazwa firmy</label>
            <input
              defaultValue="Nono Food sp. z o.o."
              className="w-full border border-coal-900/20 px-3 py-2.5 bg-paper-100 focus:outline-none focus:border-coal-900"
            />
          </div>
          <div>
            <label className="label text-coal-900/70 mb-1.5 block">NIP</label>
            <input
              defaultValue="6452601594"
              className="w-full border border-coal-900/20 px-3 py-2.5 bg-paper-100 focus:outline-none focus:border-coal-900 num"
            />
          </div>
        </div>
        <button className="bg-coal-900 text-paper-100 px-5 py-2.5 font-semibold uppercase tracking-wide hover:bg-coal-800">
          Zapisz
        </button>
      </div>

      {/* Notifications */}
      <div className="bg-snow-50 border border-bone-200 p-6">
        <h3 className="display upper-tight font-bold text-coal-900 text-lg mb-5 flex items-center gap-2">
          <Bell size={18} className="text-signal-500" /> Powiadomienia
        </h3>
        <div className="space-y-3">
          {[
            { label: "Email — potwierdzenie zamówienia", checked: true },
            { label: "Email — przypomnienia o subskrypcji", checked: true },
            { label: "SMS — status dostawy (24h przed)", checked: true },
            { label: "SMS — kurier w drodze (ETA)", checked: true },
            { label: "Email — newsletter z menu sezonowymi", checked: false },
            { label: "Email — kody rabatowe i promocje", checked: false },
          ].map((opt) => (
            <label key={opt.label} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked={opt.checked} className="w-4 h-4 accent-signal-500" />
              <span className="text-sm text-coal-900/80">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="bg-snow-50 border border-bone-200 p-6">
        <h3 className="display upper-tight font-bold text-coal-900 text-lg mb-5 flex items-center gap-2">
          <Shield size={18} className="text-signal-500" /> Bezpieczeństwo
        </h3>
        <div className="space-y-3 text-sm">
          <button className="border border-coal-900/15 hover:bg-coal-900 hover:text-paper-100 px-4 py-2.5 transition w-full sm:w-auto">
            Zmień hasło
          </button>
          <div className="text-xs text-coal-900/50">
            Ostatnie logowanie: 2026-05-20 11:42 · Katowice, PL
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-snow-50 border border-signal-500/30 p-6">
        <h3 className="display upper-tight font-bold text-coal-900 text-lg mb-3 flex items-center gap-2 text-signal-600">
          <Trash2 size={18} /> Strefa niebezpieczna
        </h3>
        <p className="text-sm text-coal-900/70 mb-4">
          Usunięcie konta jest nieodwracalne. Historia zamówień zostanie zanonimizowana zgodnie z GDPR.
        </p>
        <button className="border-2 border-signal-500 text-signal-600 hover:bg-signal-500 hover:text-snow-50 px-4 py-2.5 text-sm font-semibold uppercase tracking-wide">
          Usuń konto
        </button>
      </div>
    </div>
  )
}
