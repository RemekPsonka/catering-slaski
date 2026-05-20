import { Metadata } from "next"
import Link from "next/link"
import { MapPin, Clock, Truck, AlertCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Dostawa — strefy, ceny, terminy",
  description: "Cały Górny Śląsk + okolice. Strefy dostawy, ceny, godziny, deadline zamówień.",
}

const ZONES = [
  {
    name: "Lokalna",
    color: "bg-success-500",
    price: "19 zł",
    free_threshold: "Bezpłatna od 600 zł",
    lead: "Następny dzień",
    cities: ["Katowice", "Mysłowice", "Sosnowiec", "Chorzów", "Siemianowice"],
    description: "Centrum aglomeracji — codzienna dostawa, możliwe okna 2-godzinne",
  },
  {
    name: "Aglomeracja Śląsk",
    color: "bg-signal-500",
    price: "29 zł",
    free_threshold: "Bezpłatna od 900 zł",
    lead: "Następny dzień",
    cities: ["Gliwice", "Zabrze", "Bytom", "Ruda Śląska", "Tychy", "Tarnowskie Góry", "Piekary Śląskie", "Świętochłowice", "Mikołów", "Dąbrowa Górnicza"],
    description: "Większość Górnego Śląska — okna 3-godzinne, możliwe wcześniejsze zamówienie",
  },
  {
    name: "Regionalna PL-S",
    color: "bg-coal-900",
    price: "49 zł",
    free_threshold: "Bezpłatna od 1500 zł",
    lead: "+1-2 dni roboczych",
    cities: ["Częstochowa", "Bielsko-Biała", "Kraków (centrum)", "Opole", "Wrocław (centrum)"],
    description: "Duże miasta Małopolski i Dolnego Śląska — minimum zamówienia 600 zł",
  },
  {
    name: "Krajowa",
    color: "bg-graphite-500",
    price: "79 zł",
    free_threshold: "Bezpłatna od 3000 zł",
    lead: "+2-3 dni roboczych",
    cities: ["Cała Polska", "Warszawa", "Poznań", "Łódź", "Gdańsk"],
    description: "Wybrane produkty (BOXy + zimna płyta). Minimum zamówienia 800 zł, kurier ze stałą temperaturą",
  },
]

export default function DeliveryPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-paper-100 border-b border-bone-200 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="label text-signal-500 mb-3 inline-flex items-center gap-2">
            <Truck size={14} />
            Strefy dostawy
          </div>
          <h1 className="display upper-tight font-bold text-coal-900 text-4xl lg:text-5xl mb-3">
            Cały Śląsk + 4 makro-regiony
          </h1>
          <p className="text-coal-900/65 max-w-2xl">
            Dostarczamy w 4 strefach. Sprawdź swoją po kodzie pocztowym w koszyku — wycena dostawy pokazuje się natychmiast.
          </p>
        </div>
      </section>

      {/* Zone cards */}
      <section className="bg-paper-100 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid md:grid-cols-2 gap-5">
          {ZONES.map((z) => (
            <div key={z.name} className="bg-snow-50 border border-bone-200 p-6 lg:p-7">
              <div className="flex items-start justify-between mb-4 gap-3">
                <div className="flex items-center gap-3">
                  <span className={`w-3 h-3 ${z.color} rounded-full flex-shrink-0`}></span>
                  <h3 className="display upper-tight font-bold text-coal-900 text-2xl">{z.name}</h3>
                </div>
                <div className="text-right">
                  <div className="display upper font-bold text-coal-900 text-2xl num">{z.price}</div>
                  <div className="text-xs text-coal-900/50 num">{z.lead}</div>
                </div>
              </div>

              <p className="text-sm text-coal-900/70 leading-relaxed mb-4">{z.description}</p>

              <div className="mb-4 pb-4 border-b border-coal-900/10">
                <div className="label text-graphite-500 mb-2">{z.free_threshold}</div>
              </div>

              <div className="label text-coal-900/70 mb-2">Miasta</div>
              <div className="flex flex-wrap gap-1.5">
                {z.cities.map((c) => (
                  <span key={c} className="text-xs px-2 py-1 bg-bone-200 text-coal-900/80">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Deadlines */}
      <section className="bg-coal-900 text-paper-100 py-12 my-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-1">
              <Clock size={40} className="text-signal-500 mb-3" strokeWidth={1.4} />
              <h2 className="display upper-tight font-bold text-3xl mb-2">Deadline</h2>
              <p className="text-paper-100/70 text-sm">Zamów do końca dnia, my przywieziemy jutro.</p>
            </div>
            <div className="md:col-span-2 grid grid-cols-2 gap-3">
              <div className="bg-coal-800 p-5 border border-paper-100/10">
                <div className="display upper font-bold text-3xl text-signal-500 num">16:00</div>
                <div className="text-sm text-paper-100/70 mt-1">Lokalna · Aglomeracja</div>
                <div className="text-xs text-paper-100/50 mt-1">→ dostawa następnego dnia</div>
              </div>
              <div className="bg-coal-800 p-5 border border-paper-100/10">
                <div className="display upper font-bold text-3xl text-signal-500 num">12:00</div>
                <div className="text-sm text-paper-100/70 mt-1">Regionalna · Krajowa</div>
                <div className="text-xs text-paper-100/50 mt-1">→ +1-2 dni robocze</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-paper-100 py-12 lg:py-16 border-t border-bone-200">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          <div className="mb-8">
            <div className="label text-signal-500 mb-2">FAQ dostawy</div>
            <h2 className="display upper-tight font-bold text-coal-900 text-3xl">
              Najczęstsze pytania
            </h2>
          </div>
          <div className="space-y-3">
            {[
              { q: "Co jeśli nie ma mnie w domu?", a: "Kurier dzwoni 30 min przed dostawą (SMS + telefon). Jeśli nie odbierzesz — czeka 15 minut. Brak kontaktu = zwrot do magazynu, kolejna próba kolejnego dnia (płatna)." },
              { q: "Jak długo BOX jest świeży?", a: "BOXy są pakowane 2-3h przed dostawą. Termin spożycia: tego samego dnia do 22:00. Dłużej — przechowywać w lodówce do 24h." },
              { q: "Dostawa do biura — kurier wjeżdża windą?", a: "Tak, na każde piętro. W razie kodu do bramy / recepcji — podaj w notatce dla kuriera w checkout." },
              { q: "Mogę zmienić adres po opłaceniu?", a: "Tak, do 14:00 dnia poprzedzającego dostawę — w panelu konta lub SMS-em. Później kontakt z biurem." },
              { q: "Dostawa w weekend / święta?", a: "Sobota: Lokalna + Aglomeracja (do 14:00). Niedziela / święta: tylko zamówienia od 800 zł, dopłata +49 zł." },
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

      {/* CTA */}
      <section className="bg-bone-200 py-12 border-t border-bone-200">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 grid md:grid-cols-2 gap-6 items-center">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={20} className="text-signal-500" strokeWidth={1.6} />
              <div className="label text-signal-500">Wyjątkowy event?</div>
            </div>
            <h3 className="display upper-tight font-bold text-coal-900 text-2xl mb-2">
              Mamy ekipy w terenie
            </h3>
            <p className="text-coal-900/70 text-sm">
              Catering na plenerze, dożynkach, festynie? Wesele w pałacu? Dla zamówień powyżej 5000 zł
              uruchamiamy mobilną kuchnię z pełnym serwisem. Zadzwoń: <strong>+48 793 001 900</strong>.
            </p>
          </div>
          <div className="flex gap-3 md:justify-end flex-wrap">
            <Link href="/dla-firm" className="bg-coal-900 text-paper-100 px-5 py-3 font-semibold uppercase tracking-wide hover:bg-coal-800 transition inline-flex items-center gap-2">
              Wypełnij brief <MapPin size={14} />
            </Link>
            <a href="tel:+48793001900" className="border-2 border-coal-900 text-coal-900 px-5 py-3 font-semibold uppercase tracking-wide hover:bg-coal-900 hover:text-paper-100 transition">
              Zadzwoń
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
