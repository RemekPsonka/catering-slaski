"use client"
import { useEffect, useState } from "react"

const BACKEND = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || ""
const PUBKEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

const ALLERGENS = [
  { code: "gluten", label: "Gluten (pszenica, jęczmień)" },
  { code: "milk", label: "Mleko i laktoza" },
  { code: "eggs", label: "Jajka" },
  { code: "nuts", label: "Orzechy (drzewne)" },
  { code: "peanuts", label: "Orzeszki ziemne" },
  { code: "soy", label: "Soja" },
  { code: "fish", label: "Ryby" },
  { code: "shellfish", label: "Skorupiaki" },
  { code: "mollusks", label: "Mięczaki" },
  { code: "celery", label: "Seler" },
  { code: "mustard", label: "Gorczyca" },
  { code: "sesame", label: "Sezam" },
  { code: "sulfur", label: "Dwutlenek siarki / siarczyny" },
  { code: "lupin", label: "Łubin" },
]

const DIETS = [
  { code: "vegetarian", label: "Wegetariańska" },
  { code: "vegan", label: "Wegańska" },
  { code: "gluten_free", label: "Bezglutenowa" },
  { code: "lactose_free", label: "Bez laktozy" },
  { code: "keto", label: "Keto" },
  { code: "low_calorie", label: "Light (≤1500 kcal/dzień)" },
  { code: "high_protein", label: "Wysokobiałkowa" },
  { code: "halal", label: "Halal" },
  { code: "kosher", label: "Koszerna" },
]

export function DietaryProfileForm() {
  const [profile, setProfile] = useState<any>(null)
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    fetch(BACKEND + "/store/dietary-profile", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject("not-logged")))
      .then((d) => setProfile(d.profile ?? {}))
      .catch(() => setProfile({}))
  }, [])

  if (!profile) {
    return <p className="text-coal-900/60">Wczytuję…</p>
  }

  const toggle = (key: string, value: string) => {
    const arr: string[] = profile[key] ?? []
    const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]
    setProfile({ ...profile, [key]: next })
  }

  const save = async () => {
    setBusy(true)
    setErr(null)
    try {
      const res = await fetch(BACKEND + "/store/dietary-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(PUBKEY ? { "x-publishable-api-key": PUBKEY } : {}),
        },
        credentials: "include",
        body: JSON.stringify(profile),
      })
      if (!res.ok) throw new Error(await res.text())
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); save() }} className="space-y-8">
      <section>
        <h2 className="font-semibold mb-3 text-coal-900">Dieta</h2>
        <div className="grid grid-cols-2 gap-2">
          {DIETS.map((d) => (
            <label key={d.code} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={(profile.diet_tags ?? []).includes(d.code)}
                onChange={() => toggle("diet_tags", d.code)}
                className="accent-signal-500"
              />
              {d.label}
            </label>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-3 text-coal-900">Wyklucz alergeny (UE 14)</h2>
        <div className="grid grid-cols-2 gap-2">
          {ALLERGENS.map((a) => (
            <label key={a.code} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={(profile.excluded_allergens ?? []).includes(a.code)}
                onChange={() => toggle("excluded_allergens", a.code)}
                className="accent-rose-500"
              />
              {a.label}
            </label>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Cel kaloryczny/dzień</label>
          <input
            type="number"
            value={profile.target_calories_per_day ?? ""}
            onChange={(e) => setProfile({ ...profile, target_calories_per_day: Number(e.target.value) || null })}
            placeholder="np. 2000"
            className="border-2 border-coal-900 px-3 py-2 w-full bg-paper-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Białko/dzień (g)</label>
          <input
            type="number"
            value={profile.target_protein_g ?? ""}
            onChange={(e) => setProfile({ ...profile, target_protein_g: Number(e.target.value) || null })}
            placeholder="np. 120"
            className="border-2 border-coal-900 px-3 py-2 w-full bg-paper-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Wielkość porcji</label>
          <select
            value={profile.portion_size ?? "regular"}
            onChange={(e) => setProfile({ ...profile, portion_size: e.target.value })}
            className="border-2 border-coal-900 px-3 py-2 w-full bg-paper-100"
          >
            <option value="small">Mniejsza</option>
            <option value="regular">Standardowa</option>
            <option value="large">Większa</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ostrość</label>
          <select
            value={profile.spice_preference ?? ""}
            onChange={(e) => setProfile({ ...profile, spice_preference: e.target.value || null })}
            className="border-2 border-coal-900 px-3 py-2 w-full bg-paper-100"
          >
            <option value="">— bez znaczenia</option>
            <option value="mild">Łagodne</option>
            <option value="medium">Średnio pikantne</option>
            <option value="spicy">Pikantne</option>
            <option value="very_spicy">Bardzo pikantne</option>
          </select>
        </div>
      </section>

      <section>
        <label className="block text-sm font-medium mb-1">Notatki dla kuchni</label>
        <textarea
          rows={3}
          value={profile.kitchen_notes ?? ""}
          onChange={(e) => setProfile({ ...profile, kitchen_notes: e.target.value })}
          placeholder="np. proszę bez kolendry, dwa razy więcej sosu, alergia kontaktowa — niech kuchnia nie używa wspólnych desek"
          className="border-2 border-coal-900 px-3 py-2 w-full bg-paper-100"
        />
      </section>

      <section>
        <label className="block text-sm font-medium mb-1">Domyślne instrukcje dla kierowcy</label>
        <textarea
          rows={2}
          value={profile.default_delivery_notes ?? ""}
          onChange={(e) => setProfile({ ...profile, default_delivery_notes: e.target.value })}
          placeholder="np. kod do bramy 2143, 3. piętro, lokal po prawej, dzwoń przed dostawą"
          className="border-2 border-coal-900 px-3 py-2 w-full bg-paper-100"
        />
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="bg-signal-500 hover:bg-signal-600 text-snow-50 font-semibold uppercase tracking-wide px-6 py-3 disabled:opacity-50"
        >
          {busy ? "Zapisuję…" : "Zapisz profil"}
        </button>
        {saved && <span className="text-success-700 text-sm">✓ Zapisane</span>}
        {err && <span className="text-rose-600 text-sm">{err}</span>}
      </div>
    </form>
  )
}
