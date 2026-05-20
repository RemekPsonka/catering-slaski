import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { Plus, Heart, SlidersHorizontal } from "lucide-react"
import { DeadlineCountdown } from "@/components/menu/DeadlineCountdown"
import { CategoryTabs } from "@/components/menu/CategoryTabs"
import { FilterSidebar } from "@/components/menu/FilterSidebar"
import { listProducts, formatPrice, priceFromProduct, type Product } from "@/lib/products"

export const metadata = {
  title: "Menu — wszystkie pozycje",
  description: "200+ pozycji w 8 kategoriach. Filtruj, dodawaj do koszyka, my doręczamy.",
}

// Placeholder products used when Medusa isn't reachable yet (dev / preview).
const PLACEHOLDER_PRODUCTS = [
  { id: "prod_box_kktl_ii",  handle: "box-koktajlowy-ii",      title: "BOX koktajlowy II",      price: 34000, portions: "10-12 os", tags: ["bestseller"], rating: 5.0, reviews: 5,  img: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=85" },
  { id: "prod_box_burgers",  handle: "box-mini-burgery",       title: "BOX z mini burgerami",   price: 29000, portions: "8-10 os",  tags: ["new"],        rating: 5.0, reviews: 1,  img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=85" },
  { id: "prod_box_wege",     handle: "box-wege",               title: "BOX wege",               price: 22000, portions: "10-12 os", tags: ["veg"],        rating: 4.8, reviews: 12, img: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=85" },
  { id: "prod_box_sweets",   handle: "box-sweets",             title: "BOX ze słodkościami",    price: 24000, portions: "10-12 os", tags: ["bestseller"], rating: 4.9, reviews: 8,  img: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=85" },
  { id: "prod_zimna_klasyk", handle: "patera-kanapek-koktajlowych", title: "Patera kanapek koktajlowych", price: 29000, portions: "10-14 os", tags: ["bestseller"], rating: 4.9, reviews: 24, img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=85" },
  { id: "prod_finger_prem",  handle: "box-finger-food-premium", title: "BOX finger food premium", price: 37000, portions: "8-10 os", tags: ["new"],   rating: 5.0, reviews: 3,  img: "https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?w=800&q=85" },
  { id: "prod_rolada",       handle: "rolada-slaska-z-kluskami", title: "Rolada śląska z kluskami", price: 4800, portions: "1 os", tags: ["bestseller"], rating: 4.9, reviews: 38, img: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800&q=85" },
  { id: "prod_lunch_box",    handle: "lunch-box-standard",     title: "Lunch box · standard",   price: 3500, portions: "1 os",      tags: ["bestseller"], rating: 4.7, reviews: 142, img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=85" },
  { id: "prod_komunia",      handle: "komunia-zimna-plyta-dla-30", title: "Komunia · Zimna płyta", price: 145000, portions: "30 os", tags: ["bestseller"], rating: 5.0, reviews: 11, img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=85" },
]

const TAG_LABELS: Record<string, { label: string; cls: string }> = {
  bestseller: { label: "★ Bestseller",      cls: "bg-coal-900 text-snow-50" },
  new:        { label: "Hit lata",          cls: "bg-signal-500 text-snow-50" },
  veg:        { label: "🌱 Wege",           cls: "bg-success-500/15 text-success-700" },
  vegan:      { label: "🥬 Wegan",          cls: "bg-success-500/25 text-success-700" },
  gf:         { label: "🌾 Bezglutenowe",   cls: "bg-bone-200 text-coal-900" },
  spicy:      { label: "🌶️ Pikantne",       cls: "bg-signal-500 text-snow-50" },
}

type Card = {
  id: string
  handle: string
  title: string
  price: number
  portions: string
  tags: string[]
  rating: number
  reviews: number
  img: string
}

function productToCard(p: Product): Card {
  const tags: string[] = []
  if (p.attributes?.is_bestseller) tags.push("bestseller")
  if (p.attributes?.is_new) tags.push("new")
  if (p.attributes?.is_vegan) tags.push("vegan")
  else if (p.attributes?.is_vegetarian) tags.push("veg")
  if (p.attributes?.is_gluten_free) tags.push("gf")

  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    price: priceFromProduct(p),
    portions: p.attributes?.portions_label ?? "1 os",
    tags,
    rating: p.attributes?.rating_avg ?? 4.8,
    reviews: p.attributes?.rating_count ?? 0,
    img: p.thumbnail ?? p.images?.[0] ?? "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=85",
  }
}

type SearchParams = {
  cat?: string
  diet?: string
  occasion?: string
  guests?: string
  price_max?: string
}

function applyClientFilters(cards: Card[], sp: SearchParams): Card[] {
  let filtered = cards

  if (sp.diet) {
    const diets = sp.diet.split(",")
    filtered = filtered.filter((c) => {
      if (diets.includes("vege") && !c.tags.includes("veg") && !c.tags.includes("vegan")) return false
      if (diets.includes("vegan") && !c.tags.includes("vegan")) return false
      if (diets.includes("gf") && !c.tags.includes("gf")) return false
      return true
    })
  }

  if (sp.price_max) {
    const maxCents = parseInt(sp.price_max) * 100
    filtered = filtered.filter((c) => c.price <= maxCents)
  }

  return filtered
}

export default async function MenuPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  const { products } = await listProducts({ category: sp.cat, limit: 48 })

  const allCards: Card[] = products.length > 0
    ? products.map(productToCard)
    : PLACEHOLDER_PRODUCTS

  const cards = applyClientFilters(allCards, sp)
  const isDemoMode = products.length === 0
  const totalBeforeFilter = allCards.length
  const isFiltered = cards.length < totalBeforeFilter

  return (
    <>
      <DeadlineCountdown cutoffHour={16} />

      <section className="bg-paper-100 border-b border-coal-900/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
          <div className="label text-signal-500 mb-3">Katalog</div>
          <h1 className="display upper-tight font-bold text-4xl md:text-5xl text-coal-900 mb-3">
            Cała oferta cateringu
          </h1>
          <p className="text-coal-900/60 max-w-xl">
            200+ pozycji w 8 kategoriach. Filtruj, dodawaj do koszyka, my doręczamy.
          </p>
        </div>
      </section>

      <Suspense fallback={null}>
        <CategoryTabs />
      </Suspense>

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-3">
            <Suspense fallback={<div className="bg-snow-50 border border-bone-200 p-6 h-96" />}>
              <FilterSidebar />
            </Suspense>
          </aside>

          <main className="lg:col-span-9">
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-coal-900/60">
                <strong className="text-coal-900 num">{cards.length}</strong> pozycji
                {isFiltered && (
                  <span className="text-coal-900/40 num"> z {totalBeforeFilter}</span>
                )}
                {isDemoMode && (
                  <>
                    <span className="text-coal-900/30 mx-2">·</span>
                    <span className="text-signal-500">demo mode (Medusa nie odpowiada)</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button className="lg:hidden inline-flex items-center gap-2 text-sm text-coal-900 border border-coal-900 px-3 py-2">
                  <SlidersHorizontal size={14} /> Filtry
                </button>
                <select className="bg-snow-50 border border-coal-900/15 px-4 py-2 text-sm focus:outline-none focus:border-coal-900">
                  <option>Popularność</option>
                  <option>Cena: rosnąco</option>
                  <option>Cena: malejąco</option>
                  <option>Najwyżej oceniane</option>
                  <option>Najnowsze</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {cards.map((c) => (
                <ProductCard key={c.id} card={c} />
              ))}
            </div>

            {isDemoMode && (
              <div className="mt-10 p-5 bg-bone-200 border-l-4 border-signal-500">
                <div className="label text-signal-500 mb-1">Demo mode</div>
                <p className="text-sm text-coal-900/80">
                  Po deployu Medusa backend na Railway + uruchomieniu skryptu seed-catalog, ta strona
                  automatycznie załaduje wszystkie produkty z prawdziwej bazy (Supabase) — wraz z zdjęciami
                  z sesji, cenami zaktualizowanymi przez admin, stockiem na żywo i dostępnością w Twojej strefie.
                </p>
              </div>
            )}
          </main>
        </div>
      </section>
    </>
  )
}

function ProductCard({ card }: { card: Card }) {
  const mainTag = card.tags[0]
  const tag = mainTag ? TAG_LABELS[mainTag] : null

  return (
    <Link
      href={`/produkt/${card.handle}`}
      className="group block bg-snow-50 border border-coal-900/5 hover:border-coal-900/20 hover:-translate-y-1 transition-all"
    >
      <div className="relative aspect-square overflow-hidden bg-bone-200">
        <Image
          src={card.img}
          alt={card.title}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />
        {tag && (
          <span className={`absolute top-3 left-3 ${tag.cls} text-[10px] uppercase tracking-widest font-semibold px-2 py-1`}>
            {tag.label}
          </span>
        )}
        <button
          type="button"
          className="absolute top-3 right-3 w-9 h-9 bg-snow-50/90 backdrop-blur flex items-center justify-center text-coal-900/60 hover:text-signal-500 transition"
          aria-label="Dodaj do ulubionych"
        >
          <Heart size={16} />
        </button>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-1.5 text-xs text-coal-900/50 mb-2">
          {card.rating > 0 && (
            <>
              <span className="text-signal-500">{"★".repeat(Math.round(card.rating))}</span>
              <span className="num">
                {card.rating.toFixed(1)} {card.reviews > 0 && `(${card.reviews})`}
              </span>
              <span className="mx-1 text-coal-900/30">·</span>
            </>
          )}
          <span>{card.portions}</span>
        </div>
        <h3 className="display upper-tight font-bold text-lg text-coal-900 mb-1 group-hover:text-signal-500 transition">
          {card.title}
        </h3>
        <div className="mt-4 flex items-center justify-between">
          <span className="display upper font-bold text-2xl text-coal-900 num">
            {formatPrice(card.price)}
          </span>
          <button
            type="button"
            className="w-10 h-10 bg-coal-900 hover:bg-signal-500 text-paper-100 flex items-center justify-center transition"
            aria-label="Dodaj do koszyka"
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </Link>
  )
}
