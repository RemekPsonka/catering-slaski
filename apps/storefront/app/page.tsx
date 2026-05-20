import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Star, Clock, MapPin } from "lucide-react"

/**
 * Homepage / Landing.
 *
 * Pełna struktura, layout i copy są w /01-landing.html (mockup statyczny).
 * Ten plik to React port — żeby był live + interactive + RSC.
 *
 * TODO Sprint 1:
 *  - port wszystkich sekcji z 01-landing.html
 *  - integracja z AI Generator (komponent klient: components/ai/AIGeneratorDemo.tsx)
 *  - testimoniale z Sanity (fetch w RSC)
 *  - bestsellers z Medusa Product API (fetch w RSC)
 */
export default function HomePage() {
  return (
    <>
      {/* ===== HERO ===== */}
      <section className="bg-paper-100 border-b border-bone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-24 grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 mb-8 label text-graphite-500">
              <span className="w-6 h-px bg-coal-900"></span>
              Catering od 2019 — Górny Śląsk
            </div>

            <h1 className="display upper-tight font-bold text-coal-900 text-5xl md:text-7xl lg:text-8xl leading-[0.95]">
              Gotujemy<br/>
              mocno.<br/>
              <span className="text-signal-500">Jak Śląsk.</span>
            </h1>

            <p className="mt-8 max-w-xl text-coal-900/70 text-lg md:text-xl leading-relaxed">
              Catering eventowy i lunch firmowy z domowych receptur babci Hildy.
              Zamówisz w 3 minuty. Przywieziemy bez kombinowania.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link href="/konfigurator" className="btn-signal">
                Dobierz menu z AI <ArrowRight size={14} strokeWidth={2.5} />
              </Link>
              <Link href="/menu" className="btn-ghost">
                Pokaż menu
              </Link>
            </div>

            <div className="mt-14 grid grid-cols-3 gap-6 max-w-lg">
              <Stat value="238" label="Rodzin" />
              <Stat value="47" label="Firm" />
              <Stat value="4.9★" label="187 opinii" />
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative grainy overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1400&q=85"
                alt="Catering Śląski"
                width={1400}
                height={1600}
                priority
                className="w-full h-[520px] lg:h-[640px] object-cover"
              />
              <div className="absolute bottom-6 left-6 right-6 bg-paper-100 p-5 border border-coal-900">
                <div className="label text-graphite-500 mb-2">Dziś najczęściej zamawiane</div>
                <div className="flex items-baseline justify-between">
                  <div className="display upper font-bold text-2xl">BOX koktajlowy II</div>
                  <div className="display upper font-bold text-2xl text-signal-500">340 zł</div>
                </div>
                <div className="text-sm text-coal-900/60 mt-1">Dla 10-12 osób · Dostępny jutro</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Industrial ticker ===== */}
      <section className="bg-coal-900 text-paper-100 border-y border-coal-700 py-5 overflow-hidden">
        <div className="flex">
          <div className="flex gap-12 flex-shrink-0 animate-ticker label text-paper-100/60">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-12">
                <span>Komunie 2026</span><span className="text-signal-500">●</span>
                <span>Wesela do 150 osób</span><span className="text-signal-500">●</span>
                <span>Eventy firmowe</span><span className="text-signal-500">●</span>
                <span>Lunch dla biur</span><span className="text-signal-500">●</span>
                <span>Chrzciny / 18-stki</span><span className="text-signal-500">●</span>
                <span>Catering eventowy</span><span className="text-signal-500">●</span>
                <span>Sylwester / święta</span><span className="text-signal-500">●</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Note: Pełny landing w 01-landing.html ===== */}
      <section className="bg-paper-100 py-20">
        <div className="max-w-3xl mx-auto px-6 lg:px-10 text-center">
          <div className="label text-graphite-500 mb-4">Sprint 1 · TODO</div>
          <h2 className="display upper-tight font-bold text-2xl mb-4">
            Pozostałe sekcje (USP, kategorie, AI demo, B2B, testimoniale, story)
            są w mockupie <code className="text-signal-500">01-landing.html</code>
          </h2>
          <p className="text-coal-900/60 leading-relaxed">
            React port każdej sekcji + integracja z Medusa Product API + Sanity content
            jest w roadmap Sprintu 1.
          </p>
        </div>
      </section>
    </>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="display upper font-bold text-coal-900 text-3xl num">{value}</div>
      <div className="label text-graphite-500 mt-1">{label}</div>
    </div>
  )
}
