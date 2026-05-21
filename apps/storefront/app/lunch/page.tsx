import { Metadata } from "next"
import { buildMetadata } from "@/lib/seo/metadata"

export async function generateMetadata() {
  return buildMetadata({
    path: "/lunch",
    defaults: {
      title: 'Lunch firmowy — codzienna dostawa do biura',
      description: 'Stałe dostawy lunchu firmowego w Katowicach, Gliwicach i okolicy. Menu rotacyjne, faktura na firmę, jeden e-mail = jeden tydzień.',
      canonical: "/lunch",
      keywords: ['lunch firmowy', 'catering biuro', 'lunch box Śląsk'],
    },
  })
}
import Link from "next/link"
import { ArrowRight, Check, Truck, Calendar, Wallet, Sparkles, Clock } from "lucide-react"



const PLANS = [
  {
    code: "lunch-3w",
    name: "Lunch 3×/tydz",
    monthly_pln: 580,
    daily_avg: 49,
    discount: 5,
    perks: [
      "12-13 lunch boxów / mies.",
      "Wybór dat: pn-pt, dowolne 3 dni",
      "Mix mięsne / wege / fit (preferencje w panelu)",
      "Wstrzymanie w wakacje bez utraty rabatu",
    ],
    color: "border-bone-200",
    cta: "border",
  },
  {
    code: "lunch-5w",
    name: "Lunch dnia 5×/tydz",
    monthly_pln: 1450,
    daily_avg: 33,
    discount: 15,
    badge: "Najpopularniejszy",
    perks: [
      "20-22 lunch boxy / mies. (cały tydzień pracy)",
      "Rabat -15% vs cena katalogowa",
      "Bezpłatna dostawa w strefie Lokalna",
      "Możliwość wymiany pojedynczych dni",
      "Priorytet w okienkach godzinowych",
    ],
    color: "border-signal-500",
    cta: "signal",
  },
  {
    code: "box-weekly",
    name: "BOX tygodniowy",
    monthly_pln: 1280,
    daily_avg: 64,
    discount: 12,
    perks: [
      "4 BOXy na piątek (zespół 10-12 os)",
      "Rotacja: koktajlowy / wege / sweet / finger",
      "Dostawa rano, gotowe na 12:00",
      "Faktura zbiorcza miesięczna",
    ],
    color: "border-bone-200",
    cta: "border",
    b2b: true,
  },
]

const HOW_IT_WORKS = [
  { icon: Calendar, title: "Wybierasz plan",          desc: "3, 5 dni/tydz lub BOX tygodniowy. Zmieniasz w panelu kiedy chcesz." },
  { icon: Truck,    title: "Codziennie do biura",     desc: "Dostawa między 11:00-12:30. SMS z ETA gdy kurier jest 30 min od Ciebie." },
  { icon: Sparkles, title: "Rotacja menu",            desc: "Każdego dnia inne — szef kuchni układa 4-tygodniowy plan. Restrykcje uwzględnione." },
  { icon: Wallet,   title: "Płatność miesięczna",     desc: "Jedna faktura na koniec miesiąca. Pauza/wakacje bez kary." },
]

export default function LunchPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-coal-900 text-paper-100 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 mb-6 label text-signal-500">
                <Clock size={14} />
                Lunch dnia · subskrypcja
              </div>
              <h1 className="display upper-tight font-bold text-4xl md:text-5xl lg:text-6xl leading-[0.95]">
                Codziennie świeży obiad.<br />
                <span className="text-signal-500">Bez gotowania, bez kolejek.</span>
              </h1>
              <p className="mt-6 text-paper-100/70 text-lg max-w-xl leading-relaxed">
                Lunch box do biura. Codzienna rotacja menu, rabat do <strong className="text-signal-500">-15%</strong> przy 5×/tydz.
                Pauza w wakacje, jedna faktura miesięcznie.
              </p>

              <div className="mt-8 flex gap-3 flex-wrap">
                <a href="#plans" className="bg-signal-500 hover:bg-signal-600 text-snow-50 px-6 py-3 font-semibold uppercase tracking-wide inline-flex items-center gap-2 transition">
                  Wybierz plan <ArrowRight size={14} strokeWidth={2.5} />
                </a>
                <Link href="/dla-firm" className="border border-paper-100/40 hover:bg-paper-100 hover:text-coal-900 px-6 py-3 font-semibold uppercase tracking-wide inline-flex items-center gap-2 transition">
                  Plan firmowy
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-signal-500 text-snow-50 p-8 lg:p-10">
                <div className="label opacity-80 mb-2">Średnia oszczędność</div>
                <div className="display upper font-bold text-5xl lg:text-6xl mb-1 num">218 zł</div>
                <div className="text-snow-50/80 text-sm mb-6">na miesiąc vs zamawianie indywidualne</div>
                <div className="space-y-2 text-sm">
                  {[
                    "+15% rabatu na każdy lunch",
                    "Dostawa wliczona w cenę",
                    "Plan dietetyczny rotacyjny",
                    "Anuluj w każdej chwili",
                  ].map((p) => (
                    <div key={p} className="flex items-center gap-2">
                      <Check size={14} strokeWidth={3} /> {p}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-paper-100 py-16 border-b border-bone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="mb-10 text-center">
            <div className="label text-signal-500 mb-2">Jak to działa</div>
            <h2 className="display upper-tight font-bold text-coal-900 text-3xl lg:text-4xl">
              4 kroki do regularnego obiadu
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-coal-900/10 border border-coal-900/10">
            {HOW_IT_WORKS.map((s, i) => (
              <div key={i} className="bg-paper-100 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 bg-signal-500 text-snow-50 flex items-center justify-center font-bold num">{i + 1}</div>
                  <s.icon size={18} className="text-graphite-500" strokeWidth={1.6} />
                </div>
                <h3 className="display upper-tight font-bold text-coal-900 mb-1">{s.title}</h3>
                <p className="text-sm text-coal-900/65 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="bg-paper-100 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="mb-10 text-center">
            <div className="label text-signal-500 mb-2">Plany</div>
            <h2 className="display upper-tight font-bold text-coal-900 text-3xl lg:text-4xl mb-2">
              Wybierz tempo
            </h2>
            <p className="text-coal-900/65">Przełączaj się w panelu, gdy potrzeby zmienią.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            {PLANS.map((p) => (
              <div
                key={p.code}
                className={`bg-snow-50 border-2 ${p.color} p-7 relative ${p.cta === "signal" ? "lg:scale-105 lg:shadow-xl" : ""}`}
              >
                {p.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-signal-500 text-snow-50 text-[10px] uppercase tracking-widest font-semibold px-3 py-1">
                    {p.badge}
                  </span>
                )}
                <div className="label text-graphite-500 mb-2">{p.b2b ? "B2B" : "B2C / B2B"}</div>
                <h3 className="display upper-tight font-bold text-coal-900 text-2xl mb-4">{p.name}</h3>

                <div className="mb-4">
                  <div className="display upper font-bold text-coal-900 text-4xl num">{p.monthly_pln} zł</div>
                  <div className="text-sm text-coal-900/60 num">~{p.daily_avg} zł / dzień · -{p.discount}% rabatu</div>
                </div>

                <ul className="space-y-2 text-sm mb-7">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2">
                      <Check size={14} className="text-signal-500 mt-1 flex-shrink-0" strokeWidth={3} />
                      <span className="text-coal-900/80">{perk}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 font-semibold uppercase tracking-wide transition ${
                    p.cta === "signal"
                      ? "bg-signal-500 hover:bg-signal-600 text-snow-50"
                      : "border-2 border-coal-900 text-coal-900 hover:bg-coal-900 hover:text-paper-100"
                  }`}
                >
                  Wybierz plan
                </button>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-coal-900/60 mt-8">
            Wszystkie plany — pauza i anulacja w każdej chwili z poziomu panelu. Pierwszy tydzień ze zwrotem 100%.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-bone-200 py-16 border-t border-bone-200">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          <div className="mb-10">
            <div className="label text-signal-500 mb-2">FAQ</div>
            <h2 className="display upper-tight font-bold text-coal-900 text-3xl">
              Co pytają najczęściej
            </h2>
          </div>
          <div className="space-y-3">
            {[
              { q: "Czy mogę zmienić menu na konkretny dzień?", a: "Tak. Do 16:00 dnia poprzedniego — w panelu albo SMS-em. Nie ma limitu wymian." },
              { q: "Co z dietami — vege, vegan, bezglutenowe?", a: "Każdy plan ma 4 ścieżki dietetyczne. Wybierasz przy aktywacji, możesz zmienić w dowolnym momencie." },
              { q: "Pauza na wakacje — tracę rabat?", a: "Nie. Pauza nawet do 4 tygodni / rok bez utraty zniżki. Powyżej negocjujemy indywidualnie." },
              { q: "Faktura?", a: "Tak, dla firm — zbiorcza miesięczna z NIP. Dla osób prywatnych paragon elektroniczny." },
              { q: "Strefa dostawy?", a: "Cały Górny Śląsk — Katowice, Sosnowiec, Gliwice, Tychy, Bytom, Chorzów, Ruda, Zabrze i 17 innych miast. Sprawdź po kodzie pocztowym w koszyku." },
            ].map((item) => (
              <details key={item.q} className="bg-snow-50 border border-coal-900/10 p-4 group">
                <summary className="font-semibold text-coal-900 cursor-pointer flex items-center justify-between gap-3 list-none">
                  {item.q}
                  <span className="text-signal-500 group-open:rotate-45 transition-transform text-xl leading-none">+</span>
                </summary>
                <p className="mt-3 text-sm text-coal-900/70 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
