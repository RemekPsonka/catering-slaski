import { buildMetadata } from "@/lib/seo/metadata"

export async function generateMetadata() {
  return buildMetadata({
    path: "/polityka-prywatnosci",
    defaults: {
      title: "Polityka prywatności Catering Śląski",
      description: "Informacje o przetwarzaniu danych osobowych, RODO, pliki cookies.",
      canonical: "/polityka-prywatnosci",
    },
  })
}

export default function PolitykaPage() {
  return (
    <article className="bg-paper-100 min-h-[60vh]">
      <section className="max-w-3xl mx-auto px-6 lg:px-10 py-12 prose prose-coal">
        <h1>Polityka prywatności</h1>
        <p className="text-sm text-coal-900/60">Wersja 1.0 — obowiązuje od 2026-05-21</p>

        <h2>1. Administrator danych</h2>
        <p><em>[TODO REMIGIUSZ: pełne dane administratora — nazwa, adres, NIP, dane kontaktowe IOD jeśli powołano]</em></p>

        <h2>2. Cele i podstawy prawne</h2>
        <ul>
          <li>Realizacja zamówień — art. 6 ust. 1 lit. b RODO</li>
          <li>Wystawianie faktur — art. 6 ust. 1 lit. c (obowiązek prawny)</li>
          <li>Newsletter — art. 6 ust. 1 lit. a (zgoda)</li>
          <li>Marketing remarketingowy (Meta Pixel, Google Ads) — zgoda przez cookie banner</li>
          <li>Analityka (GA4) — uzasadniony interes / zgoda</li>
        </ul>

        <h2>3. Odbiorcy danych</h2>
        <ul>
          <li>Stripe / Przelewy24 — procesor płatności</li>
          <li>Resend — dostawca e-mail transakcyjnych</li>
          <li>DPD / InPost / lokalni kurierzy — dostawa</li>
          <li>Google LLC (GA4, GTM) — analityka, jeśli wyrażono zgodę</li>
          <li>Meta — Meta Pixel, jeśli wyrażono zgodę</li>
        </ul>

        <h2>4. Pliki cookies</h2>
        <p>
          Używamy cookies funkcjonalnych (zawsze) i analitycznych/reklamowych (za zgodą).
          Zarządzasz nimi przez baner zgody w stopce strony.
        </p>

        <h2>5. Prawa</h2>
        <p>Masz prawo do: dostępu, sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia, sprzeciwu, wycofania zgody, skargi do PUODO.</p>

        <h2>6. Okres przechowywania</h2>
        <p>
          Dane zamówień: 5 lat (obowiązek księgowy). Newsletter: do wycofania zgody.
          Cookies: do 13 miesięcy lub wycofania zgody.
        </p>

        <h2>7. Kontakt</h2>
        <p>W sprawach RODO: <a href="mailto:rodo@cateringslaski.pl">rodo@cateringslaski.pl</a> <em>[TODO REMIGIUSZ: utworzyć alias]</em></p>
      </section>
    </article>
  )
}
