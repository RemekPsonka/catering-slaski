import { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Building2, Calendar, FileText, Shield, Sparkles, TrendingUp, Phone } from "lucide-react"
import { EventBriefForm } from "@/components/configurator/EventBriefForm"

export const metadata: Metadata = {
  title: "Catering dla firm — wesela, komunie, eventy firmowe",
  description: "Konfigurator B2B: opisz event, dostaniesz dopasowane menu z wyceną w 24h. Faktura VAT, NIP, dostawa Śląsk.",
}

const FEATURES = [
  { icon: FileText, title: "Faktura VAT",     desc: "NIP, przelew 14 dni, B2B onboarding bez papierów" },
  { icon: Calendar, title: "Plan terminów",   desc: "Zaplanuj cały rok: kwartalnie, sezonowo, na zawołanie" },
  { icon: Shield,   title: "Gwarancja jakości", desc: "Stała ekipa kucharzy, audyt sanitarny SANEPID 2026" },
  { icon: TrendingUp, title: "Rabaty wolumenowe", desc: "Od 10% przy 50+ os, do -20% przy długoterminowej współpracy" },
]

const OCCASIONS = [
  { slug: "wesele",         emoji: "💍", title: "Wesele",                desc: "100-300 osób, pełen serwis, finger food + danie główne + tort", color: "from-signal-500/10 to-paper-100" },
  { slug: "komunia",        emoji: "⛪", title: "Komunia / chrzciny",     desc: "30-80 osób, tradycyjne menu, deserowy stół, dostawa w niedzielę", color: "from-success-500/10 to-paper-100" },
  { slug: "event-firmowy",  emoji: "💼", title: "Event firmowy",         desc: "30-200 osób, networking, finger food, AV-friendly", color: "from-bone-200 to-paper-100" },
  { slug: "kick-off",       emoji: "🚀", title: "Kick-off / launch",     desc: "Premiera produktu, startup mixer, cocktail party", color: "from-signal-100 to-paper-100" },
  { slug: "jubileusz",      emoji: "🎉", title: "Jubileusz firmy",       desc: "Okrągłe rocznice, gala wieczorna, ślaskie tradycje + premium", color: "from-warning-500/10 to-paper-100" },
  { slug: "sylwester",      emoji: "🎆", title: "Sylwester firmowy",     desc: "Pełna noc, danie ciepłe + zimna płyta + bufet słodki", color: "from-coal-900/5 to-paper-100" },
]

export default function B2BPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-paper-100 border-b border-bone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-20">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 mb-6 label text-graphite-500">
                <Building2 size={14} />
                Dla firm i eventów · od 30 osób
              </div>
              <h1 className="display upper-tight font-bold text-coal-900 text-4xl md:text-5xl lg:text-6xl leading-[0.95]">
                Catering eventowy<br />
                <span className="text-signal-500">bez zgadywania budżetu.</span>
              </h1>
              <p className="mt-6 text-coal-900/70 text-lg max-w-xl leading-relaxed">
                Opisz event w 2 minuty — wycena, propozycja menu i ETA gotowa w 24h. Faktura VAT, NIP, przelew 14 dni.
                Obsługujemy 280+ firm z całego Śląska.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <a href="#brief" className="bg-coal-900 hover:bg-coal-800 text-paper-100 px-6 py-3 font-semibold uppercase tracking-wide inline-flex items-center gap-2 transition">
                  Wypełnij brief <ArrowRight size={14} strokeWidth={2.5} />
                </a>
                <a href="tel:+48793001900" className="border-2 border-coal-900 hover:bg-coal-900 hover:text-paper-100 text-coal-900 px-6 py-3 font-semibold uppercase tracking-wide inline-flex items-center gap-2 transition">
                  <Phone size={14} /> +48 793 001 900
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-coal-900 text-paper-100 p-8 lg:p-10">
                <div className="label text-signal-500 mb-3">Trust signal</div>
                <div className="display upper font-bold text-5xl lg:text-6xl mb-1 num">280+</div>
                <div className="text-sm text-paper-100/70 mb-6">firm z całego Śląska obsługujemy regularnie</div>
                <div className="space-y-3 text-sm">
                  {["KGHM Polska Miedź", "Tauron Polska Energia", "Górażdże", "NoBo Studio", "Tesco Polska", "+ 275 innych"].map((c) => (
                    <div key={c} className="flex items-center gap-2.5 text-paper-100/80">
                      <span className="w-1 h-1 bg-signal-500 rounded-full"></span>
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-paper-100 py-12 lg:py-16 border-b border-bone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-coal-900/10 border border-coal-900/10">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-paper-100 p-6">
              <f.icon size={24} className="text-signal-500 mb-3" strokeWidth={1.6} />
              <h3 className="display upper-tight font-bold text-coal-900 mb-1">{f.title}</h3>
              <p className="text-sm text-coal-900/65 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Occasion cards */}
      <section className="bg-paper-100 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="mb-10">
            <div className="label text-signal-500 mb-3">Rodzaje eventów</div>
            <h2 className="display upper-tight font-bold text-coal-900 text-3xl lg:text-4xl">
              Sprawdzeni w 6 formatach
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {OCCASIONS.map((o) => (
              <div
                key={o.slug}
                className={`relative bg-gradient-to-br ${o.color} border border-coal-900/10 p-6 hover:border-coal-900 transition cursor-pointer group`}
              >
                <div className="text-3xl mb-3">{o.emoji}</div>
                <h3 className="display upper-tight font-bold text-coal-900 text-lg mb-2">{o.title}</h3>
                <p className="text-sm text-coal-900/70 leading-relaxed mb-4">{o.desc}</p>
                <a href={`#brief?occasion=${o.slug}`} className="text-xs text-signal-500 hover:text-signal-600 inline-flex items-center gap-1 font-semibold uppercase tracking-wide">
                  Wybierz <ArrowRight size={12} strokeWidth={2.5} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brief form */}
      <section id="brief" className="bg-bone-200 py-16 lg:py-20 border-t border-bone-200">
        <div className="max-w-4xl mx-auto px-6 lg:px-10">
          <div className="mb-10 text-center">
            <div className="label text-signal-500 mb-3 flex items-center justify-center gap-2">
              <Sparkles size={14} /> Brief eventowy
            </div>
            <h2 className="display upper-tight font-bold text-coal-900 text-3xl lg:text-4xl mb-3">
              Opisz event — wycena w 24h
            </h2>
            <p className="text-coal-900/65 max-w-2xl mx-auto">
              4 kroki × 1 minuta. Nie potrzebujesz wszystkich detali — uzupełnimy w rozmowie.
            </p>
          </div>

          <EventBriefForm />
        </div>
      </section>

      {/* AI alternative */}
      <section className="bg-paper-100 py-12 border-t border-bone-200">
        <div className="max-w-4xl mx-auto px-6 lg:px-10 text-center">
          <div className="label text-signal-500 mb-3">Wolisz natychmiast?</div>
          <h3 className="display upper-tight font-bold text-coal-900 text-2xl lg:text-3xl mb-4">
            Wpisz brief w AI Generator — odpowiedź w 15 sekund
          </h3>
          <p className="text-coal-900/65 mb-6 max-w-xl mx-auto">
            Bez logowania, bez maila. Otrzymasz wstępną wycenę — możesz ją zatwierdzić od razu albo przesłać przez brief powyżej z dopytaniem o detale.
          </p>
          <Link href="/konfigurator" className="bg-signal-500 hover:bg-signal-600 text-snow-50 px-6 py-3 font-semibold uppercase tracking-wide inline-flex items-center gap-2 transition">
            <Sparkles size={14} /> Otwórz AI Generator
          </Link>
        </div>
      </section>
    </>
  )
}
