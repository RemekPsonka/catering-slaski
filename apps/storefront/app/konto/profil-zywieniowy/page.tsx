import { buildMetadata } from "@/lib/seo/metadata"
import { DietaryProfileForm } from "@/components/account/DietaryProfileForm"

export async function generateMetadata() {
  return buildMetadata({
    path: "/konto/profil-zywieniowy",
    defaults: {
      title: "Profil żywieniowy",
      description: "Twoje preferencje dietetyczne — alergeny, makro, ostrość, notatki dla kuchni.",
      canonical: "/konto/profil-zywieniowy",
      noindex: true,
    },
  })
}

export default function ProfilZywieniowyPage() {
  return (
    <article className="bg-paper-100 min-h-[60vh]">
      <section className="max-w-3xl mx-auto px-6 lg:px-10 py-10">
        <h1 className="text-3xl font-bold display upper-tight mb-2">Profil żywieniowy</h1>
        <p className="text-coal-900/70 mb-8">
          Zapisz raz — Twoje zamówienia będą automatycznie filtrowane (alergeny ukryte, sugerowane dania zgodne z dietą).
        </p>
        <DietaryProfileForm />
      </section>
    </article>
  )
}
