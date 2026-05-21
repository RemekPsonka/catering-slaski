import { Metadata } from "next"
import { buildMetadata } from "@/lib/seo/metadata"

export async function generateMetadata() {
  return buildMetadata({
    path: "/konfigurator",
    defaults: {
      title: 'Konfigurator menu AI — odpowiedź w 15 sekund',
      description: 'Powiedz nam typ eventu, liczbę gości i budżet — nasz AI ułoży dopasowane menu z mocnymi przekąskami i daniami śląskimi. Bezpłatnie, bez logowania.',
      canonical: "/konfigurator",
      keywords: ['konfigurator catering', 'AI menu', 'catering Śląsk online'],
    },
  })
}
import { AIGenerator } from "@/components/configurator/AIGenerator"



export default function KonfiguratorPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-paper-100 border-b border-bone-200 py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 text-center">
          <div className="inline-flex items-center gap-2 mb-6 label text-graphite-500">
            <span className="w-6 h-px bg-coal-900"></span>
            AI Generator menu · Pierwsze w PL · Beta
            <span className="w-1.5 h-1.5 rounded-full bg-signal-500 animate-pulse"></span>
          </div>
          <h1 className="display upper-tight font-bold text-coal-900 text-4xl md:text-5xl lg:text-6xl leading-[0.95]">
            Opisz event.<br />
            <span className="text-signal-500">Menu w 15 sekundach.</span>
          </h1>
          <p className="mt-6 text-coal-900/70 text-lg max-w-2xl mx-auto leading-relaxed">
            AI zna 200+ pozycji z naszego menu — ceny, alergeny, sezonowość. Napisz brief po polsku.
          </p>
        </div>
      </section>

      {/* Main */}
      <section className="bg-paper-100 py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-10">
          <AIGenerator />
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-paper-100 border-t border-bone-200 py-12">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 grid md:grid-cols-3 gap-0 border-l border-coal-900">
          <div className="border-r border-coal-900 p-6 text-center">
            <div className="display upper font-bold text-signal-500 text-4xl num">15 s</div>
            <div className="label text-graphite-500 mt-2">średni czas</div>
          </div>
          <div className="border-r border-coal-900 p-6 text-center">
            <div className="display upper font-bold text-signal-500 text-4xl num">93%</div>
            <div className="label text-graphite-500 mt-2">w budżecie</div>
          </div>
          <div className="p-6 text-center">
            <div className="display upper font-bold text-signal-500 text-4xl num">200+</div>
            <div className="label text-graphite-500 mt-2">pozycji w bazie</div>
          </div>
        </div>
      </section>
    </>
  )
}
