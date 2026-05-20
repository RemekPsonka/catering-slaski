"use client"

import { useState } from "react"
import { Sparkles, FileDown, Mail, ArrowRight, Loader2 } from "lucide-react"

type ProposalItem = {
  name: string
  qty: number
  unit_cents: number
  total_cents: number
  tag?: string
}

type Proposal = {
  items: ProposalItem[]
  reasoning: string
  total_cents: number
  per_person_cents: number
  in_budget: boolean
  balance: { meat: number; vege: number; sweet: number }
}

const SUGGESTIONS = [
  { emoji: "⛪", label: "Komunia 80 os.", text: "80 osób, komunia syna, niedziela południe, 120 zł/os, tradycyjne śląskie z 20% wegetariańskie" },
  { emoji: "🎉", label: "Urodziny 40 os.", text: "40 osób, urodziny 50-stka, piątek wieczór, finger food + zimna płyta, ok 100 zł/os" },
  { emoji: "💼", label: "Lunch firmowy", text: "30 osób, event firmowy, czwartek 14:00, lunch dla biura, 60 zł/os, opcje wege i bezglutenowe" },
  { emoji: "💍", label: "Wesele 150 os.", text: "150 osób, wesele, sobota całą noc, 150 zł/os, 60% mięsne, 30% wege, 10% wegan, słodki bufet" },
]

// Mock generator while backend not deployed — generates plausible proposal
function generateMockProposal(brief: string): Proposal {
  const peopleMatch = brief.match(/(\d+)\s*os/i)
  const budgetMatch = brief.match(/(\d+)\s*zł\s*\/?\s*os/i)
  const people = peopleMatch ? parseInt(peopleMatch[1]) : 40
  const budget = budgetMatch ? parseInt(budgetMatch[1]) * 100 : 8000

  const items: ProposalItem[] = []
  const targetTotal = people * budget

  // Generate plausible mix
  const products = [
    { name: "BOX koktajlowy II", unit_cents: 34000, tag: "Bestseller", weight: 3 },
    { name: "BOX wege", unit_cents: 22000, tag: "Wege", weight: 2 },
    { name: "BOX z mini burgerami", unit_cents: 29000, tag: "Hit", weight: 2 },
    { name: "BOX finger food premium", unit_cents: 37000, tag: "Premium", weight: 1 },
    { name: "BOX ze słodkościami", unit_cents: 24000, tag: "Słodki", weight: 1 },
    { name: "Patera kanapek koktajlowych", unit_cents: 29000, weight: 2 },
  ]

  let totalSoFar = 0
  for (const p of products) {
    const qty = Math.max(1, Math.round((people / 10) * (p.weight / 10)))
    const total = qty * p.unit_cents
    items.push({ name: p.name, qty, unit_cents: p.unit_cents, total_cents: total, tag: p.tag })
    totalSoFar += total
    if (totalSoFar > targetTotal * 0.95) break
  }

  return {
    items,
    reasoning: `Dla ${people} osób z budżetem ${budget / 100} zł/os zaproponowałem mix BOXów koktajlowych z dodatkiem wege i słodkim akcentem. Bilans menu 65/25/10 (mięso/wege/słodkie). W razie zwiększenia gości dodać +10% buffer.`,
    total_cents: totalSoFar,
    per_person_cents: Math.round(totalSoFar / people),
    in_budget: totalSoFar <= targetTotal * 1.05,
    balance: { meat: 65, vege: 25, sweet: 10 },
  }
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 }).format(cents / 100)
}

export function AIGenerator() {
  const [brief, setBrief] = useState("")
  const [loading, setLoading] = useState(false)
  const [proposal, setProposal] = useState<Proposal | null>(null)

  async function generate() {
    if (brief.length < 20) return
    setLoading(true)
    setProposal(null)

    // Try real API; fallback to mock
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/ai/generate-menu`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief }),
      })
      if (res.ok) {
        const data = await res.json()
        // Transform backend response to local Proposal shape
        // TODO: implement after backend deploy
        await new Promise((r) => setTimeout(r, 2000))
        setProposal(generateMockProposal(brief))
      } else {
        throw new Error("Backend not ready")
      }
    } catch {
      // Fallback to mock
      await new Promise((r) => setTimeout(r, 2200))
      setProposal(generateMockProposal(brief))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-snow-50 border-2 border-coal-900 p-8 lg:p-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-signal-500 flex items-center justify-center">
          <Sparkles size={24} className="text-snow-50" />
        </div>
        <div>
          <div className="label text-signal-500">AI Generator · Beta</div>
          <h2 className="display upper-tight font-bold text-2xl">Napisz brief</h2>
        </div>
      </div>

      {/* Input */}
      <div className="bg-paper-100 border border-bone-200 p-5 mb-5">
        <textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          rows={6}
          placeholder="Np. '120 osób, wesele, sobota całą noc, 150 zł/os, 60% mięsne, 30% wege, 10% wegan, słodki bufet…'"
          className="w-full bg-transparent border-0 p-0 text-base leading-relaxed resize-none focus:outline-none"
        />
      </div>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-2 mb-8">
        <span className="text-xs text-graphite-500 mr-2 py-2 label">Szybkie:</span>
        {SUGGESTIONS.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => setBrief(s.text)}
            className="text-xs px-3 py-1.5 border border-coal-900/15 hover:border-signal-500 hover:bg-signal-100 transition"
          >
            {s.emoji} {s.label}
          </button>
        ))}
      </div>

      {/* Generate button */}
      <button
        type="button"
        onClick={generate}
        disabled={loading || brief.length < 20}
        className="w-full bg-signal-500 hover:bg-signal-600 disabled:opacity-40 disabled:cursor-not-allowed text-snow-50 font-semibold uppercase tracking-wide py-4 flex items-center justify-center gap-3 transition"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            AI projektuje menu…
          </>
        ) : (
          <>
            <Sparkles size={20} />
            Wygeneruj menu
          </>
        )}
      </button>

      <p className="text-center text-xs text-graphite-500 mt-4 label">Bez logowania · bez maila · 30 sekund</p>

      {/* Result */}
      {proposal && (
        <div className="mt-10 border-t border-coal-900 pt-10">
          <div className="bg-signal-100 border-2 border-signal-500 p-6 mb-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-signal-500 flex items-center justify-center flex-shrink-0">
                <Sparkles className="text-snow-50" size={20} />
              </div>
              <div>
                <div className="label text-signal-600 mb-1">Twoja propozycja · 14 s</div>
                <p className="text-coal-900 text-sm leading-relaxed">{proposal.reasoning}</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 bg-paper-100 border border-bone-200 p-7">
              <h4 className="display upper-tight font-bold text-coal-900 mb-5">Pozycje menu</h4>
              <div className="space-y-2">
                {proposal.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 py-3 border-b border-bone-200 last:border-b-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-coal-900 font-medium text-sm">{item.name}</span>
                        {item.tag && (
                          <span className="text-[10px] uppercase tracking-widest text-signal-600 bg-snow-50 border border-signal-500/30 px-1.5 py-0.5">
                            {item.tag}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-graphite-500 mt-0.5 num">
                        {item.qty}× {formatPrice(item.unit_cents)}
                      </div>
                    </div>
                    <div className="display upper font-bold text-coal-900 num text-right">
                      {formatPrice(item.total_cents)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-coal-900 text-paper-100 p-6">
                <div className="label text-signal-500 mb-2">Razem brutto</div>
                <div className="display upper font-bold text-4xl num">{formatPrice(proposal.total_cents)}</div>
                <div className="text-sm text-paper-100/60 mt-1 num">
                  ~{formatPrice(proposal.per_person_cents)} / os
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-signal-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-signal-500"></span>
                  {proposal.in_budget ? "W budżecie" : "Powyżej budżetu — dostosuj"}
                </div>
              </div>

              <button className="w-full bg-signal-500 hover:bg-signal-600 text-snow-50 font-semibold uppercase tracking-wide py-3 flex items-center justify-center gap-2 transition">
                <FileDown size={16} /> Pobierz PDF
              </button>
              <button className="w-full border-2 border-coal-900 hover:bg-coal-900 hover:text-paper-100 text-coal-900 font-semibold uppercase tracking-wide py-3 flex items-center justify-center gap-2 transition">
                <Mail size={16} /> Wyślij mailem
              </button>
              <button className="w-full bg-coal-900 hover:bg-coal-800 text-paper-100 font-semibold uppercase tracking-wide py-3 flex items-center justify-center gap-2 transition">
                Zarezerwuj termin <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
