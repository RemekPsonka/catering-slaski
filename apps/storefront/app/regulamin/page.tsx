import { buildMetadata } from "@/lib/seo/metadata"

export async function generateMetadata() {
  return buildMetadata({
    path: "/regulamin",
    defaults: {
      title: "Regulamin sklepu Catering Śląski",
      description: "Regulamin sprzedaży i dostaw cateringu, prawa i obowiązki klienta, polityka reklamacji.",
      canonical: "/regulamin",
    },
  })
}

export default function RegulaminPage() {
  return (
    <article className="bg-paper-100 min-h-[60vh]">
      <section className="max-w-3xl mx-auto px-6 lg:px-10 py-12 prose prose-coal">
        <h1>Regulamin sklepu Catering Śląski</h1>
        <p className="text-sm text-coal-900/60">Wersja 1.0 — obowiązuje od 2026-05-21</p>

        <h2>§1. Postanowienia ogólne</h2>
        <p>
          Sklep internetowy pod adresem <strong>cateringslaski.pl</strong> prowadzony jest przez
          <em> [TODO: pełne dane firmy — nazwa, adres, NIP, KRS]</em> (dalej: Sprzedawca).
        </p>

        <h2>§2. Definicje</h2>
        <p><em>[TODO REMIGIUSZ: uzupełnić definicje — Klient, Konsument, Produkt, Strefa Dostawy, Okienko Czasowe, Deadline]</em></p>

        <h2>§3. Zamówienia</h2>
        <p><em>[TODO REMIGIUSZ: opisać proces składania zamówienia, deadliny per strefa, akceptację]</em></p>

        <h2>§4. Płatności</h2>
        <p>
          Akceptowane metody płatności: BLIK, karty płatnicze, Apple Pay, Google Pay, Przelewy24 (dla
          klientów indywidualnych); płatność z odroczonym terminem (przelew B2B) dla firm po
          akceptacji Sprzedawcy.
        </p>

        <h2>§5. Dostawa</h2>
        <p>
          Dostawa realizowana w strefach: <em>[TODO REMIGIUSZ: pełna lista stref + cen + deadline'ów]</em>.
        </p>

        <h2>§6. Prawo odstąpienia (dla Konsumentów)</h2>
        <p>
          <strong>Uwaga:</strong> zgodnie z art. 38 ustawy o prawach konsumenta, prawo odstąpienia od
          umowy zawartej na odległość NIE PRZYSŁUGUJE w przypadku produktów spożywczych szybko
          psujących się (catering świeży). Wyjątek: vouchery i prowiant suchy — 14 dni na zwrot.
        </p>

        <h2>§7. Reklamacje</h2>
        <p><em>[TODO REMIGIUSZ: procedura reklamacyjna, terminy odpowiedzi, kontakt]</em></p>

        <h2>§8. Dane osobowe</h2>
        <p>
          Administrator danych osobowych: Sprzedawca. Szczegóły w
          <a href="/polityka-prywatnosci"> Polityce prywatności</a>.
        </p>

        <h2>§9. Postanowienia końcowe</h2>
        <p><em>[TODO REMIGIUSZ: jurysdykcja, prawo właściwe, zmiany regulaminu]</em></p>
      </section>
    </article>
  )
}
