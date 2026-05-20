"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Check, MapPin, Calendar, User, CreditCard, ShieldCheck, Loader2 } from "lucide-react"
import { useCart } from "@/lib/cart-store"

function formatPrice(cents: number) {
  return new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 }).format(cents / 100)
}

type Step = 1 | 2 | 3 | 4 | 5

const STEP_LABELS: Record<Step, { label: string; icon: any }> = {
  1: { label: "Adres", icon: MapPin },
  2: { label: "Termin", icon: Calendar },
  3: { label: "Dane", icon: User },
  4: { label: "Płatność", icon: CreditCard },
  5: { label: "Potwierdzenie", icon: ShieldCheck },
}

export function CheckoutFlow() {
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState<Step>(1)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [address, setAddress] = useState({ street: "", city: "Katowice", postcode: "", floor: "", note: "" })
  const [zone, setZone] = useState<{ name: string; price_cents: number } | null>(null)
  const [date, setDate] = useState("")
  const [slot, setSlot] = useState("")
  const [contact, setContact] = useState({ firstName: "", lastName: "", email: "", phone: "", company: "", nip: "" })
  const [billingType, setBillingType] = useState<"B2C" | "B2B">("B2C")
  const [paymentMethod, setPaymentMethod] = useState<"blik" | "card" | "applepay" | "invoice">("blik")
  const [terms, setTerms] = useState(false)
  const [marketing, setMarketing] = useState(false)

  const items = useCart((s) => s.items)
  const clear = useCart((s) => s.clear)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const subtotal = items.reduce((sum, i) => sum + i.qty * i.price_cents, 0)
  const delivery = zone?.price_cents ?? 2900
  const total = subtotal + delivery

  // Mock zone lookup when postcode changes
  useEffect(() => {
    if (address.postcode.length === 6 || address.postcode.length === 5) {
      const code = address.postcode.replace("-", "")
      if (code.startsWith("40")) setZone({ name: "Lokalna (Katowice)", price_cents: 1900 })
      else if (code.startsWith("41") || code.startsWith("44")) setZone({ name: "Aglomeracja Śląsk", price_cents: 2900 })
      else if (code.startsWith("30") || code.startsWith("50")) setZone({ name: "Regionalna PL-S", price_cents: 4900 })
      else setZone({ name: "Krajowa", price_cents: 7900 })
    } else {
      setZone(null)
    }
  }, [address.postcode])

  function nextStep() {
    setStep((s) => (s < 5 ? ((s + 1) as Step) : s))
  }
  function prevStep() {
    setStep((s) => (s > 1 ? ((s - 1) as Step) : s))
  }

  async function placeOrder() {
    setSubmitting(true)
    // TODO: integrate Medusa createCart → setShippingAddress → setShippingMethod → completeCart → Stripe
    await new Promise((r) => setTimeout(r, 1500))
    setSubmitting(false)
    setStep(5)
  }

  if (items.length === 0 && step < 5) {
    return (
      <div className="bg-snow-50 border border-bone-200 p-12 text-center">
        <h2 className="display upper-tight font-bold text-coal-900 text-2xl mb-2">Koszyk jest pusty</h2>
        <p className="text-coal-900/60 mb-6">Wróć do menu, żeby coś wybrać.</p>
        <Link href="/menu" className="bg-coal-900 text-paper-100 px-6 py-3 font-semibold uppercase tracking-wide">
          Otwórz menu
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Stepper */}
      <div className="mb-10">
        <div className="flex items-center gap-1 lg:gap-2 overflow-x-auto pb-2">
          {([1, 2, 3, 4, 5] as Step[]).map((s) => {
            const { label, icon: Icon } = STEP_LABELS[s]
            const isActive = s === step
            const isDone = s < step
            return (
              <div key={s} className="flex items-center gap-1 lg:gap-2 flex-shrink-0">
                <div
                  className={`w-9 h-9 lg:w-11 lg:h-11 flex items-center justify-center border-2 ${
                    isActive
                      ? "border-signal-500 bg-signal-500 text-snow-50"
                      : isDone
                      ? "border-coal-900 bg-coal-900 text-paper-100"
                      : "border-coal-900/20 text-coal-900/40"
                  }`}
                >
                  {isDone ? <Check size={18} /> : <Icon size={16} />}
                </div>
                <div className="hidden lg:block">
                  <div className="label text-coal-900/50">Krok {s}</div>
                  <div className={`text-sm font-medium ${isActive ? "text-coal-900" : isDone ? "text-coal-900" : "text-coal-900/40"}`}>
                    {label}
                  </div>
                </div>
                {s < 5 && (
                  <div className={`w-6 lg:w-12 h-px ${isDone ? "bg-coal-900" : "bg-coal-900/20"}`}></div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Main */}
        <div className="lg:col-span-8">
          {/* STEP 1 — Address */}
          {step === 1 && (
            <div className="bg-snow-50 border border-bone-200 p-6 lg:p-8">
              <h2 className="display upper-tight font-bold text-coal-900 text-2xl mb-1">Adres dostawy</h2>
              <p className="text-coal-900/60 text-sm mb-6">Sprawdzimy strefę i koszt dostawy.</p>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="label text-coal-900/70 mb-1.5 block">Ulica i numer *</label>
                  <input
                    type="text"
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    placeholder="np. Mariacka 12"
                    className="w-full border border-coal-900/20 px-3 py-2.5 bg-paper-100 focus:outline-none focus:border-coal-900"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label text-coal-900/70 mb-1.5 block">Kod pocztowy *</label>
                    <input
                      type="text"
                      value={address.postcode}
                      onChange={(e) => setAddress({ ...address, postcode: e.target.value })}
                      placeholder="40-014"
                      className="w-full border border-coal-900/20 px-3 py-2.5 bg-paper-100 focus:outline-none focus:border-coal-900 num"
                    />
                  </div>
                  <div>
                    <label className="label text-coal-900/70 mb-1.5 block">Miasto *</label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="w-full border border-coal-900/20 px-3 py-2.5 bg-paper-100 focus:outline-none focus:border-coal-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="label text-coal-900/70 mb-1.5 block">Piętro / kod do bramy</label>
                  <input
                    type="text"
                    value={address.floor}
                    onChange={(e) => setAddress({ ...address, floor: e.target.value })}
                    placeholder="II piętro · domofon 12K"
                    className="w-full border border-coal-900/20 px-3 py-2.5 bg-paper-100 focus:outline-none focus:border-coal-900"
                  />
                </div>
                <div>
                  <label className="label text-coal-900/70 mb-1.5 block">Notatka dla kuriera</label>
                  <textarea
                    value={address.note}
                    onChange={(e) => setAddress({ ...address, note: e.target.value })}
                    rows={2}
                    placeholder="np. zostawić u recepcjonisty"
                    className="w-full border border-coal-900/20 px-3 py-2.5 bg-paper-100 focus:outline-none focus:border-coal-900 resize-none"
                  />
                </div>
              </div>

              {zone && (
                <div className="mt-6 bg-signal-100 border border-signal-500/30 p-4 flex items-center justify-between">
                  <div>
                    <div className="label text-signal-600">Strefa wykryta</div>
                    <div className="font-medium text-coal-900">{zone.name}</div>
                  </div>
                  <div className="display upper font-bold text-coal-900 num">{formatPrice(zone.price_cents)}</div>
                </div>
              )}

              <div className="mt-8 flex justify-end">
                <button
                  onClick={nextStep}
                  disabled={!address.street || !address.postcode}
                  className="bg-coal-900 text-paper-100 px-6 py-3 font-semibold uppercase tracking-wide hover:bg-coal-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Dalej → Termin
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 — Date + slot */}
          {step === 2 && (
            <div className="bg-snow-50 border border-bone-200 p-6 lg:p-8">
              <h2 className="display upper-tight font-bold text-coal-900 text-2xl mb-1">Termin dostawy</h2>
              <p className="text-coal-900/60 text-sm mb-6">Wybierz dzień i okno czasowe.</p>

              <div className="mb-6">
                <label className="label text-coal-900/70 mb-2 block">Data dostawy</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                  className="w-full sm:w-auto border border-coal-900/20 px-3 py-2.5 bg-paper-100 focus:outline-none focus:border-coal-900 num"
                />
              </div>

              <div>
                <label className="label text-coal-900/70 mb-2 block">Okno czasowe</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {["08:00-10:00", "10:00-12:00", "12:00-14:00", "14:00-16:00", "16:00-18:00", "18:00-20:00"].map((s) => {
                    const isActive = slot === s
                    const isFull = s === "12:00-14:00" // mock
                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={isFull}
                        onClick={() => setSlot(s)}
                        className={`py-3 text-sm font-medium border transition num ${
                          isActive
                            ? "bg-coal-900 text-paper-100 border-coal-900"
                            : isFull
                            ? "border-bone-200 text-coal-900/30 cursor-not-allowed line-through"
                            : "border-coal-900/15 hover:bg-coal-900 hover:text-paper-100"
                        }`}
                      >
                        {s}
                        {isFull && <div className="text-[10px] mt-0.5">brak miejsc</div>}
                      </button>
                    )
                  })}
                </div>
                <p className="text-xs text-graphite-500 mt-3">Rezerwacja okna trwa 15 minut.</p>
              </div>

              <div className="mt-8 flex justify-between">
                <button onClick={prevStep} className="text-coal-900/60 hover:text-coal-900">← Wstecz</button>
                <button
                  onClick={nextStep}
                  disabled={!date || !slot}
                  className="bg-coal-900 text-paper-100 px-6 py-3 font-semibold uppercase tracking-wide hover:bg-coal-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Dalej → Dane
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 — Contact */}
          {step === 3 && (
            <div className="bg-snow-50 border border-bone-200 p-6 lg:p-8">
              <h2 className="display upper-tight font-bold text-coal-900 text-2xl mb-1">Twoje dane</h2>
              <p className="text-coal-900/60 text-sm mb-6">Potrzebujemy ich do potwierdzenia zamówienia.</p>

              <div className="flex gap-2 mb-6 border border-coal-900/15">
                <button
                  onClick={() => setBillingType("B2C")}
                  className={`flex-1 py-2.5 text-sm font-medium ${billingType === "B2C" ? "bg-coal-900 text-paper-100" : ""}`}
                >
                  Osoba prywatna
                </button>
                <button
                  onClick={() => setBillingType("B2B")}
                  className={`flex-1 py-2.5 text-sm font-medium ${billingType === "B2B" ? "bg-coal-900 text-paper-100" : ""}`}
                >
                  Firma · faktura VAT
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-coal-900/70 mb-1.5 block">Imię *</label>
                  <input
                    type="text"
                    value={contact.firstName}
                    onChange={(e) => setContact({ ...contact, firstName: e.target.value })}
                    className="w-full border border-coal-900/20 px-3 py-2.5 bg-paper-100 focus:outline-none focus:border-coal-900"
                  />
                </div>
                <div>
                  <label className="label text-coal-900/70 mb-1.5 block">Nazwisko *</label>
                  <input
                    type="text"
                    value={contact.lastName}
                    onChange={(e) => setContact({ ...contact, lastName: e.target.value })}
                    className="w-full border border-coal-900/20 px-3 py-2.5 bg-paper-100 focus:outline-none focus:border-coal-900"
                  />
                </div>
                <div>
                  <label className="label text-coal-900/70 mb-1.5 block">Email *</label>
                  <input
                    type="email"
                    value={contact.email}
                    onChange={(e) => setContact({ ...contact, email: e.target.value })}
                    className="w-full border border-coal-900/20 px-3 py-2.5 bg-paper-100 focus:outline-none focus:border-coal-900"
                  />
                </div>
                <div>
                  <label className="label text-coal-900/70 mb-1.5 block">Telefon *</label>
                  <input
                    type="tel"
                    value={contact.phone}
                    onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                    placeholder="+48 ..."
                    className="w-full border border-coal-900/20 px-3 py-2.5 bg-paper-100 focus:outline-none focus:border-coal-900 num"
                  />
                </div>
                {billingType === "B2B" && (
                  <>
                    <div className="col-span-2">
                      <label className="label text-coal-900/70 mb-1.5 block">Nazwa firmy *</label>
                      <input
                        type="text"
                        value={contact.company}
                        onChange={(e) => setContact({ ...contact, company: e.target.value })}
                        className="w-full border border-coal-900/20 px-3 py-2.5 bg-paper-100 focus:outline-none focus:border-coal-900"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="label text-coal-900/70 mb-1.5 block">NIP *</label>
                      <input
                        type="text"
                        value={contact.nip}
                        onChange={(e) => setContact({ ...contact, nip: e.target.value })}
                        placeholder="10 cyfr"
                        maxLength={10}
                        className="w-full border border-coal-900/20 px-3 py-2.5 bg-paper-100 focus:outline-none focus:border-coal-900 num"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="mt-8 flex justify-between">
                <button onClick={prevStep} className="text-coal-900/60 hover:text-coal-900">← Wstecz</button>
                <button
                  onClick={nextStep}
                  disabled={!contact.firstName || !contact.lastName || !contact.email || !contact.phone || (billingType === "B2B" && (!contact.company || !contact.nip))}
                  className="bg-coal-900 text-paper-100 px-6 py-3 font-semibold uppercase tracking-wide hover:bg-coal-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Dalej → Płatność
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 — Payment */}
          {step === 4 && (
            <div className="bg-snow-50 border border-bone-200 p-6 lg:p-8">
              <h2 className="display upper-tight font-bold text-coal-900 text-2xl mb-1">Płatność</h2>
              <p className="text-coal-900/60 text-sm mb-6">Wybierz preferowaną metodę.</p>

              <div className="space-y-2 mb-6">
                {[
                  { id: "blik", label: "BLIK", desc: "Najszybsza opcja · 6-cyfrowy kod" },
                  { id: "card", label: "Karta", desc: "Visa · Mastercard · 3D Secure" },
                  { id: "applepay", label: "Apple Pay / Google Pay", desc: "Touch ID · Face ID" },
                  ...(billingType === "B2B"
                    ? [{ id: "invoice", label: "Przelew 14 dni", desc: "Faktura VAT z odroczonym terminem" }]
                    : []),
                ].map((m) => (
                  <label
                    key={m.id}
                    className={`flex items-center gap-3 border p-4 cursor-pointer transition ${
                      paymentMethod === m.id
                        ? "border-signal-500 bg-signal-100/30"
                        : "border-coal-900/15 hover:border-coal-900/40"
                    }`}
                  >
                    <input
                      type="radio"
                      checked={paymentMethod === m.id}
                      onChange={() => setPaymentMethod(m.id as any)}
                      className="w-4 h-4 accent-signal-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-coal-900">{m.label}</div>
                      <div className="text-xs text-coal-900/60">{m.desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="space-y-3 mb-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={terms}
                    onChange={(e) => setTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 accent-signal-500"
                  />
                  <span className="text-sm text-coal-900/80">
                    Akceptuję <Link href="/regulamin" className="underline">regulamin</Link> i <Link href="/polityka-prywatnosci" className="underline">politykę prywatności</Link> *
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={marketing}
                    onChange={(e) => setMarketing(e.target.checked)}
                    className="w-4 h-4 mt-0.5 accent-signal-500"
                  />
                  <span className="text-sm text-coal-900/70">
                    Chcę otrzymywać newsletter z menu sezonowymi (do 2 maili / mies.)
                  </span>
                </label>
              </div>

              <div className="flex justify-between">
                <button onClick={prevStep} className="text-coal-900/60 hover:text-coal-900">← Wstecz</button>
                <button
                  onClick={placeOrder}
                  disabled={!terms || submitting}
                  className="bg-signal-500 hover:bg-signal-600 text-snow-50 px-8 py-3 font-semibold uppercase tracking-wide disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={18} /> Przetwarzam…
                    </>
                  ) : (
                    <>Zapłać {formatPrice(total)}</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5 — Confirmation */}
          {step === 5 && (
            <div className="bg-snow-50 border-2 border-success-500 p-8 lg:p-12 text-center">
              <div className="w-16 h-16 bg-success-500 rounded-full flex items-center justify-center mx-auto mb-5">
                <Check size={32} className="text-snow-50" strokeWidth={3} />
              </div>
              <h2 className="display upper-tight font-bold text-coal-900 text-3xl mb-3">
                Zamówienie przyjęte
              </h2>
              <p className="text-coal-900/70 mb-6 max-w-md mx-auto">
                Wysłaliśmy potwierdzenie na <strong className="text-coal-900">{contact.email || "twój adres"}</strong>.
                SMS z linkiem do śledzenia przyjdzie ~24h przed dostawą.
              </p>
              <div className="bg-paper-100 border border-coal-900/10 p-5 mb-6 max-w-md mx-auto text-left space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-coal-900/60">Numer zamówienia</span>
                  <span className="num font-mono">CS-2026-{Math.floor(Math.random() * 90000 + 10000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-coal-900/60">Data dostawy</span>
                  <span className="num">{date} · {slot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-coal-900/60">Strefa</span>
                  <span>{zone?.name}</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t border-coal-900/10">
                  <span>Razem</span>
                  <span className="num">{formatPrice(total)}</span>
                </div>
              </div>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link href="/konto/zamowienia" className="bg-coal-900 text-paper-100 px-6 py-3 font-semibold uppercase tracking-wide hover:bg-coal-800">
                  Moje zamówienia
                </Link>
                <Link href="/menu" onClick={() => clear()} className="border-2 border-coal-900 text-coal-900 px-6 py-3 font-semibold uppercase tracking-wide hover:bg-coal-900 hover:text-paper-100">
                  Wróć do menu
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Summary sidebar */}
        {step < 5 && (
          <div className="lg:col-span-4">
            <div className="bg-snow-50 border border-bone-200 p-6 lg:sticky lg:top-32">
              <h3 className="display upper-tight font-bold text-coal-900 text-lg mb-4">
                Twoje zamówienie
              </h3>
              <div className="space-y-3 mb-4 pb-4 border-b border-coal-900/10">
                {items.map((item) => (
                  <div key={item.slug} className="flex justify-between gap-3 text-sm">
                    <div className="flex-1">
                      <div className="text-coal-900">{item.name}</div>
                      <div className="text-xs text-coal-900/50 num">{item.qty}× {formatPrice(item.price_cents)}</div>
                    </div>
                    <div className="num text-coal-900">{formatPrice(item.qty * item.price_cents)}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-sm mb-4 pb-4 border-b border-coal-900/10">
                <div className="flex justify-between">
                  <span className="text-coal-900/70">Wartość</span>
                  <span className="num">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-coal-900/70">Dostawa {zone && `· ${zone.name}`}</span>
                  <span className="num">{formatPrice(delivery)}</span>
                </div>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="display upper-tight font-bold text-coal-900">Razem</span>
                <span className="display upper font-bold text-coal-900 num text-2xl">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
