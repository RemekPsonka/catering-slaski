import { Award, Gift, Sparkles } from "lucide-react"

export const metadata = { title: "Program lojalnościowy" }

const TIERS = [
  { name: "Brąz",   threshold: 0,    benefits: ["Zbieranie punktów (1 pkt = 1 zł)", "Powiadomienia o nowościach"] },
  { name: "Srebro", threshold: 1000, benefits: ["Wszystko z Brąz", "Bezpłatna dostawa w strefie Lokalna", "Wcześniejszy dostęp do menu sezonowych"] },
  { name: "Złoto",  threshold: 1500, benefits: ["Wszystko ze Srebra", "Rabat -10% na wszystkie zamówienia", "Indywidualny opiekun konta"] },
  { name: "Diament",threshold: 5000, benefits: ["Wszystko ze Złota", "Rabat -15%", "VIP rezerwacja terminów", "Darmowy degustator co kwartał"] },
]

const REWARDS = [
  { name: "Bezpłatna dostawa", cost: 200, available: true },
  { name: "BOX deserowy gratis (wartość 80 zł)", cost: 600, available: true },
  { name: "Voucher 100 zł", cost: 1000, available: true },
  { name: "Voucher 250 zł", cost: 2200, available: false },
  { name: "Sesja degustacyjna dla 4 os.", cost: 4000, available: false },
]

export default function LoyaltyPage() {
  const currentPoints = 1240
  const currentTier = TIERS[1] // Srebro
  const nextTier = TIERS[2]
  const progress = ((currentPoints - currentTier.threshold) / (nextTier.threshold - currentTier.threshold)) * 100

  return (
    <div className="space-y-6">
      <div>
        <div className="label text-graphite-500 mb-1">Konto</div>
        <h1 className="display upper-tight font-bold text-coal-900 text-3xl lg:text-4xl">
          Program lojalnościowy
        </h1>
      </div>

      {/* Status card */}
      <div className="bg-coal-900 text-paper-100 p-7 lg:p-9">
        <div className="flex items-start gap-5 mb-6">
          <div className="w-16 h-16 bg-signal-500 flex items-center justify-center flex-shrink-0">
            <Award size={32} className="text-snow-50" strokeWidth={1.6} />
          </div>
          <div className="flex-1">
            <div className="label text-signal-500 mb-1">Status</div>
            <div className="display upper-tight font-bold text-3xl lg:text-4xl">
              {currentTier.name}
            </div>
            <div className="display upper font-bold num text-signal-500 text-xl mt-1">
              {currentPoints.toLocaleString("pl-PL")} pkt
            </div>
          </div>
        </div>

        <div className="mb-2 flex justify-between text-sm text-paper-100/70">
          <span>Status {currentTier.name}</span>
          <span>Status {nextTier.name}</span>
        </div>
        <div className="bg-coal-800 h-2 mb-2 overflow-hidden">
          <div className="bg-signal-500 h-full" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="text-xs text-paper-100/60 num">
          {nextTier.threshold - currentPoints} pkt do statusu {nextTier.name}
        </div>
      </div>

      {/* Tiers */}
      <div>
        <h3 className="display upper-tight font-bold text-coal-900 text-xl mb-4">Poziomy</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {TIERS.map((t, i) => {
            const isCurrent = t.name === currentTier.name
            return (
              <div
                key={t.name}
                className={`p-5 border ${
                  isCurrent ? "border-signal-500 bg-signal-100/30" : "border-bone-200 bg-snow-50"
                }`}
              >
                <div className="flex items-baseline justify-between mb-3">
                  <div className="display upper-tight font-bold text-coal-900 text-lg">{t.name}</div>
                  <div className="text-xs text-coal-900/50 num">od {t.threshold.toLocaleString("pl-PL")} pkt</div>
                </div>
                <ul className="space-y-1.5 text-sm text-coal-900/80">
                  {t.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <span className="text-signal-500 flex-shrink-0 mt-1">▪</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>

      {/* Rewards */}
      <div>
        <h3 className="display upper-tight font-bold text-coal-900 text-xl mb-4 flex items-center gap-2">
          <Gift size={20} className="text-signal-500" /> Nagrody do wymiany
        </h3>
        <div className="bg-snow-50 border border-bone-200 divide-y divide-bone-200">
          {REWARDS.map((r) => {
            const canAfford = r.available && currentPoints >= r.cost
            return (
              <div key={r.name} className="p-4 flex items-center gap-4 flex-wrap">
                <Sparkles size={18} className="text-signal-500 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-coal-900 font-medium">{r.name}</div>
                  <div className="text-xs text-coal-900/50 num">{r.cost.toLocaleString("pl-PL")} pkt</div>
                </div>
                <button
                  disabled={!canAfford}
                  className={`px-4 py-2 text-sm font-semibold uppercase tracking-wide transition ${
                    canAfford
                      ? "bg-signal-500 text-snow-50 hover:bg-signal-600"
                      : "bg-coal-900/5 text-coal-900/30 cursor-not-allowed"
                  }`}
                >
                  {canAfford ? "Wymień" : "Brak punktów"}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
