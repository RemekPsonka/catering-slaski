import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, MapPin, Users, ChefHat, Award } from "lucide-react"

export const metadata: Metadata = {
  title: "O nas — Catering od 2019, Górny Śląsk",
  description: "Catering Śląski to 7 lat domowej kuchni babci Hildy, 280+ obsłużonych firm, 1240+ rodzin. Trzy pokolenia, jedna pasja.",
}

const NUMBERS = [
  { value: "238", label: "Rodzin obsłużonych w 2025" },
  { value: "280+", label: "Firm regularnie korzystających" },
  { value: "7", label: "Lat na rynku" },
  { value: "25", label: "Miast Śląska" },
  { value: "18", label: "Osób w ekipie" },
  { value: "4.9", label: "Średnia ocena (Google)" },
]

const VALUES = [
  {
    icon: ChefHat,
    title: "Receptury babci Hildy",
    desc: "Trzy pokolenia kuchni. Rolada śląska, żurek, krupnik wojskowy — robimy je tak jak nas nauczono w domu.",
  },
  {
    icon: MapPin,
    title: "Lokalni dostawcy",
    desc: "Mięso od Antka z Mikołowa, sery z Pszczyny, warzywa od śląskich rolników. Krótszy łańcuch, świeższy smak.",
  },
  {
    icon: Award,
    title: "Bez ściemy",
    desc: "Cena na stronie = cena na fakturze. Nie ma ukrytych dopłat za serwetki, za 'transport ekspres', za nic.",
  },
  {
    icon: Users,
    title: "Mała ekipa, duża odpowiedzialność",
    desc: "Każde zamówienie idzie przez te same ręce — nie outsourcujemy do podwykonawców.",
  },
]

const TIMELINE = [
  { year: "2019", event: "Start z kuchnią w Dąbrowie Górniczej — 4 osoby w ekipie." },
  { year: "2020", event: "Pivot do BOXów koktajlowych podczas pandemii. Pierwsze 100 zamówień firmowych." },
  { year: "2022", event: "Wejście do Katowic i Sosnowca. Pierwsze wesele dla 200 osób." },
  { year: "2024", event: "Lunch dnia jako subskrypcja. KGHM i Tauron jako stali klienci." },
  { year: "2025", event: "238 rodzin obsłużonych. SANEPID audit bez uwag." },
  { year: "2026", event: "Nowy sklep online + AI Generator menu. Rozszerzenie do Krakowa." },
]

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-paper-100 py-16 lg:py-24 border-b border-bone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-7">
              <div className="label text-signal-500 mb-4">Catering Śląski · od 2019</div>
              <h1 className="display upper-tight font-bold text-coal-900 text-4xl md:text-5xl lg:text-6xl leading-[0.95] mb-6">
                Trzy pokolenia.<br />
                <span className="text-signal-500">Jedna pasja.</span>
              </h1>
              <p className="text-coal-900/70 text-lg max-w-xl leading-relaxed">
                Zaczęliśmy w 2019 roku z jedną kuchnią w Dąbrowie Górniczej i recepturami babci Hildy.
                Dziś obsługujemy 280+ firm i 1240+ rodzin w całej aglomeracji śląskiej —
                ale gotujemy nadal tak samo: bez kompromisów, bez ściemy, ze świeżych składników.
              </p>
            </div>
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/5] overflow-hidden bg-bone-200">
                <Image
                  src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&q=85"
                  alt="Ekipa Catering Śląski w kuchni"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Numbers */}
      <section className="bg-coal-900 text-paper-100 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-3 md:grid-cols-6 gap-px bg-paper-100/10">
          {NUMBERS.map((n) => (
            <div key={n.label} className="bg-coal-900 p-5 text-center">
              <div className="display upper font-bold text-3xl lg:text-4xl text-signal-500 num">{n.value}</div>
              <div className="text-[10px] uppercase tracking-widest text-paper-100/60 mt-2 leading-tight">{n.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="bg-paper-100 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="mb-10">
            <div className="label text-signal-500 mb-2">Co robimy inaczej</div>
            <h2 className="display upper-tight font-bold text-coal-900 text-3xl lg:text-4xl">
              4 zasady które nas trzymają
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {VALUES.map((v) => (
              <div key={v.title} className="bg-snow-50 border border-bone-200 p-6 lg:p-7">
                <v.icon size={28} className="text-signal-500 mb-4" strokeWidth={1.5} />
                <h3 className="display upper-tight font-bold text-coal-900 text-xl mb-2">{v.title}</h3>
                <p className="text-coal-900/70 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-bone-200 py-16 lg:py-20 border-t border-bone-200">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          <div className="mb-10 text-center">
            <div className="label text-signal-500 mb-2">Historia</div>
            <h2 className="display upper-tight font-bold text-coal-900 text-3xl lg:text-4xl">
              Od jednej kuchni do całego Śląska
            </h2>
          </div>
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-px bg-coal-900/20"></div>
            <div className="space-y-6">
              {TIMELINE.map((item) => (
                <div key={item.year} className="flex gap-5 relative">
                  <div className="w-10 h-10 bg-signal-500 text-snow-50 flex items-center justify-center font-bold flex-shrink-0 relative z-10">
                    <span className="text-xs num">{item.year.slice(2)}</span>
                  </div>
                  <div className="pt-1.5">
                    <div className="display upper font-bold text-coal-900 text-lg num">{item.year}</div>
                    <div className="text-coal-900/75 mt-1">{item.event}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-paper-100 py-16 border-t border-bone-200">
        <div className="max-w-3xl mx-auto px-6 lg:px-10 text-center">
          <h2 className="display upper-tight font-bold text-coal-900 text-3xl mb-3">
            Spróbuj naszej kuchni
          </h2>
          <p className="text-coal-900/65 mb-6 max-w-xl mx-auto">
            Najlepiej zacząć od BOXa koktajlowego II — naszego bestsellera. 10-12 osób, 340 zł, dostawa jutro.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/menu" className="bg-signal-500 hover:bg-signal-600 text-snow-50 px-6 py-3 font-semibold uppercase tracking-wide inline-flex items-center gap-2 transition">
              Otwórz menu <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
            <Link href="/dla-firm" className="border-2 border-coal-900 text-coal-900 px-6 py-3 font-semibold uppercase tracking-wide hover:bg-coal-900 hover:text-paper-100 transition">
              Brief dla firmy
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
