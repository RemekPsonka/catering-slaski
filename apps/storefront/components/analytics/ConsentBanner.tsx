"use client"
/**
 * Minimalist RODO consent banner.
 * Persists choice in localStorage and updates Consent Mode + Meta Pixel.
 * Three actions: Accept all / Reject all / Adjust (3 toggles).
 *
 * Brand-styled (coal/paper/signal). Replaceable later by Cookiebot/Iubenda
 * — just remove this component, banner script will own the consent_update.
 */
import { useEffect, useState } from "react"
import { ACCEPTED_CONSENT, DEFAULT_CONSENT, REJECTED_CONSENT, type ConsentState } from "@/lib/analytics/events"
import { updateConsent } from "@/lib/analytics"

const STORAGE_KEY = "cs-consent-v1"

function loadConsent(): ConsentState | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ConsentState
  } catch {
    return null
  }
}

function saveConsent(state: ConsentState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {}
}

export function ConsentBanner() {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [state, setState] = useState<ConsentState>(DEFAULT_CONSENT)

  useEffect(() => {
    const existing = loadConsent()
    if (existing) {
      setState(existing)
      updateConsent(existing) // re-apply on every load so GTM sees it
      return
    }
    setOpen(true)
  }, [])

  const apply = (next: ConsentState) => {
    setState(next)
    saveConsent(next)
    updateConsent(next)
    setOpen(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 bg-[#0A0908] text-[#F5F2EC] shadow-2xl border-t border-[#E54B17]/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 lg:py-6">
        <div className="flex flex-col lg:flex-row gap-5 lg:items-start">
          <div className="flex-1 text-sm leading-relaxed">
            <p className="font-semibold text-base mb-1">Pliki cookie i prywatność</p>
            <p className="opacity-80">
              Używamy plików cookie, żeby strona działała sprawnie, mierzyć ruch i pokazywać Ci dopasowane treści.
              Możesz zaakceptować wszystko, odrzucić nieobowiązkowe albo dostroić wybór.{" "}
              <a href="/polityka-prywatnosci" className="underline hover:text-[#E54B17]">
                Polityka prywatności
              </a>
              .
            </p>

            {expanded && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <Toggle
                  label="Niezbędne"
                  hint="Sesja, koszyk, bezpieczeństwo. Zawsze włączone."
                  checked={true}
                  disabled
                />
                <Toggle
                  label="Analityka"
                  hint="GA4 — agregowane statystyki bez profilowania."
                  checked={state.analytics}
                  onChange={(v) => setState({ ...state, analytics: v })}
                />
                <Toggle
                  label="Reklama"
                  hint="Meta Pixel, Google Ads — remarketing, mierzenie konwersji."
                  checked={state.ad}
                  onChange={(v) =>
                    setState({ ...state, ad: v, ad_personalization: v, ad_user_data: v })
                  }
                />
                <Toggle
                  label="Personalizacja"
                  hint="Rekomendacje na bazie historii zamówień."
                  checked={state.personalization}
                  onChange={(v) => setState({ ...state, personalization: v })}
                />
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 lg:flex-shrink-0">
            {!expanded ? (
              <button
                onClick={() => setExpanded(true)}
                className="text-xs underline opacity-80 hover:opacity-100 self-start sm:self-center px-2"
              >
                Dostosuj
              </button>
            ) : (
              <button
                onClick={() => apply(state)}
                className="px-4 py-2.5 text-sm font-semibold border border-[#F5F2EC]/40 hover:border-[#F5F2EC]"
              >
                Zapisz wybór
              </button>
            )}
            <button
              onClick={() => apply(REJECTED_CONSENT)}
              className="px-4 py-2.5 text-sm font-semibold border border-[#F5F2EC]/40 hover:border-[#F5F2EC]"
            >
              Odrzuć
            </button>
            <button
              onClick={() => apply(ACCEPTED_CONSENT)}
              className="px-4 py-2.5 text-sm font-semibold bg-[#E54B17] hover:bg-[#FF5A1F] text-white"
            >
              Akceptuję wszystko
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
  disabled,
}: {
  label: string
  hint: string
  checked: boolean
  onChange?: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <label className={`flex items-start gap-3 ${disabled ? "opacity-60" : "cursor-pointer"}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="mt-1 h-4 w-4 accent-[#E54B17]"
      />
      <span>
        <span className="block font-semibold">{label}</span>
        <span className="block opacity-70">{hint}</span>
      </span>
    </label>
  )
}
