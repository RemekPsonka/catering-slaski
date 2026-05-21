import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Potwierdzenie zapisu — newsletter",
  robots: { index: false, follow: false },
}

const BACKEND = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || ""
const PUBKEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

type Params = Promise<{ [k: string]: string }>

async function confirm(token: string): Promise<{ ok: boolean; code?: string; message?: string }> {
  if (!token || !BACKEND) return { ok: false, message: "Brak tokenu" }
  try {
    const url = new URL(BACKEND + "/store/newsletter/confirm")
    url.searchParams.set("token", token)
    const res = await fetch(url.toString(), {
      headers: PUBKEY ? { "x-publishable-api-key": PUBKEY } : {},
      cache: "no-store",
    })
    const data = await res.json()
    if (res.status === 410) return { ok: false, message: "Link wygasł" }
    if (!res.ok) return { ok: false, message: data.message ?? "Błąd" }
    return { ok: true, code: data.welcome_code }
  } catch {
    return { ok: false, message: "Błąd sieci" }
  }
}

export default async function NewsletterConfirmPage({
  searchParams,
}: {
  searchParams: Params
}) {
  const sp = await searchParams
  const result = await confirm(sp.token ?? "")
  return (
    <article className="bg-paper-100 min-h-[60vh]">
      <section className="max-w-2xl mx-auto px-6 lg:px-10 py-16">
        {result.ok ? (
          <>
            <h1 className="text-4xl font-bold display upper-tight mb-4">Dziękujemy! 🎉</h1>
            <p className="text-coal-900/80 mb-4">
              Twój zapis do newslettera Catering Śląski został potwierdzony. Cieszymy się, że jesteś z nami.
            </p>
            {result.code && (
              <div className="bg-signal-100 border-2 border-signal-500 p-5 my-6">
                <p className="text-xs uppercase tracking-wide text-coal-900/70 mb-1">Twój kod powitalny</p>
                <p className="display upper font-bold text-2xl text-signal-500">{result.code}</p>
                <p className="text-sm text-coal-900/70 mt-2">
                  -10% na pierwsze zamówienie powyżej 100 zł. Wpisz w koszyku.
                </p>
              </div>
            )}
            <a href="/menu" className="inline-block bg-signal-500 hover:bg-signal-600 text-snow-50 font-semibold uppercase tracking-wide px-6 py-3">
              Zobacz menu
            </a>
          </>
        ) : (
          <>
            <h1 className="text-4xl font-bold display upper-tight mb-4">Coś poszło nie tak</h1>
            <p className="text-coal-900/80 mb-4">{result.message}</p>
            <a href="/" className="underline">Wróć na stronę główną</a>
          </>
        )}
      </section>
    </article>
  )
}
