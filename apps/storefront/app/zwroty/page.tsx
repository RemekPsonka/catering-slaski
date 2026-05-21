import { buildMetadata } from "@/lib/seo/metadata"

export async function generateMetadata() {
  return buildMetadata({
    path: "/zwroty",
    defaults: {
      title: "Reklamacje i zwroty",
      description: "Jak zgłosić reklamację, terminy odpowiedzi, kiedy przysługuje zwrot.",
      canonical: "/zwroty",
    },
  })
}

export default function ZwrotyPage() {
  return (
    <article className="bg-paper-100 min-h-[60vh]">
      <section className="max-w-3xl mx-auto px-6 lg:px-10 py-12 prose prose-coal">
        <h1>Reklamacje i zwroty</h1>

        <h2>Reklamacja zamówienia</h2>
        <p>
          Jeśli coś poszło nie tak — niesmaczne danie, brak pozycji, opóźniona dostawa — zgłoś nam to
          w ciągu <strong>24h od dostawy</strong>. Mail: <a href="mailto:zamowienia@cateringslaski.pl">zamowienia@cateringslaski.pl</a>
          lub telefon: <a href="tel:+48793001900">+48 793 001 900</a>.
        </p>

        <h2>Co dołączyć</h2>
        <ul>
          <li>Numer zamówienia (CS-XXXXX)</li>
          <li>Krótki opis problemu</li>
          <li>Zdjęcia (jeśli to defekt dania lub niekompletna dostawa)</li>
        </ul>

        <h2>Terminy</h2>
        <p>Odpowiadamy w ciągu 24h roboczych. Decyzję podejmujemy w 14 dni (zwykle szybciej).</p>

        <h2>Refund</h2>
        <p>
          W razie uznania reklamacji: zwrot na tę samą metodę płatności w ciągu 7 dni, lub voucher
          o wartości +20% kwoty reklamowanej (zwykle wybierany).
        </p>

        <h2>Prawo odstąpienia</h2>
        <p>
          <strong>Świeży catering (boxy, lunch, dania na zamówienie):</strong> NIE przysługuje prawo
          odstąpienia (art. 38 ustawy o prawach konsumenta — produkty szybko psujące się).
        </p>
        <p>
          <strong>Vouchery, prowiant suchy:</strong> 14 dni na odstąpienie. Voucher musi być
          niewykorzystany.
        </p>
      </section>
    </article>
  )
}
