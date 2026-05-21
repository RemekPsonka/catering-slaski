"use client"
import { useState } from "react"
import { track } from "@/lib/analytics"

const BACKEND = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || ""
const PUBKEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

const CONSENT_TEXT =
  "Wyrażam zgodę na otrzymywanie newslettera Catering Śląski na adres podany powyżej. Zgodę mogę wycofać w każdej chwili linkiem w mailu. Administrator: Catering Śląski, kontakt: zamowienia@cateringslaski.pl."

export function NewsletterSignup({ source = "footer" }: { source?: string }) {
  const [email, setEmail] = useState("")
  const [state, setState] = useState<"idle" | "loading" | "sent" | "error">("idle")
  const [message, setMessage] = useState("")

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.match(/^[^@]+@[^@]+\.[^@]+$/)) return
    setState("loading")
    try {
      const res = await fetch(BACKEND + "/store/newsletter/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(PUBKEY ? { "x-publishable-api-key": PUBKEY } : {}),
        },
        body: JSON.stringify({ email, consent_text: CONSENT_TEXT, source }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? "error")
      track({ event: "generate_lead", lead_type: "newsletter" })
      setState("sent")
      setMessage(data.message ?? "Sprawdź skrzynkę i potwierdź zapis.")
    } catch (err: any) {
      setState("error")
      setMessage(err.message ?? "Nie udało się zapisać")
    }
  }

  if (state === "sent") {
    return (
      <div className="bg-success-500/10 border border-success-500/30 p-4 text-sm text-success-700">
        ✓ {message}
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <label className="block text-xs uppercase tracking-wide text-coal-900/60">Newsletter</label>
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="twoj@mail.com"
          className="flex-1 border-2 border-coal-900 bg-paper-100 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="bg-signal-500 text-snow-50 font-semibold uppercase tracking-wide px-4 py-2 text-sm disabled:opacity-50"
        >
          {state === "loading" ? "..." : "Zapisz"}
        </button>
      </div>
      <p className="text-xs text-coal-900/60">{CONSENT_TEXT}</p>
      {state === "error" && <p className="text-xs text-rose-600">{message}</p>}
    </form>
  )
}
