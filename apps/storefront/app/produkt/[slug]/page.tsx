import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Truck, Clock, CreditCard, Sparkles } from "lucide-react"
import { AddToCart } from "@/components/product/AddToCart"
import { getProductByHandle, formatPrice, priceFromProduct } from "@/lib/products"

type Params = Promise<{ slug: string }>

// Demo fallback when Medusa isn't reachable
const PLACEHOLDER_PRODUCTS: Record<string, any> = {
  "box-koktajlowy-ii": {
    slug: "box-koktajlowy-ii",
    handle: "box-koktajlowy-ii",
    name: "BOX koktajlowy II",
    description:
      "Najczęściej zamawiany BOX na imprezy w domu. Mix wytrawnych mini-przekąsek dla 10-12 osób w eleganckim drewnianym pudełku. Otwórz, podaj, gotowe.",
    price_cents: 34000,
    portions: "10-12 os",
    rating: 5.0,
    reviews: 5,
    tags: ["bestseller", "veg-option", "gf-option"],
    images: [
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=1200&q=90",
      "https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?w=600&q=80",
      "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&q=80",
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
    ],
    contents: [
      "24 kanapki koktajlowe (4 rodzaje: łosoś, kurczak, tatar, vege)",
      "Mini-tartlette z foie gras (12 szt)",
      "Patera serów + winogron + orzechów (na 12 os)",
      "Bruschettas z pomidorem i bazylią (16 szt)",
      "Owoce sezonowe + figi suszone",
    ],
    allergens: ["gluten", "milk", "eggs", "fish"],
    cross_sells: [
      { slug: "box-wege",   name: "BOX wege",            price_cents: 22000 },
      { slug: "box-sweets", name: "BOX ze słodkościami", price_cents: 24000 },
    ],
  },
}

async function getProduct(slug: string) {
  // Try Medusa first
  const product = await getProductByHandle(slug)

  if (product) {
    const tags: string[] = []
    if (product.attributes?.is_bestseller) tags.push("bestseller")
    if (product.attributes?.is_new) tags.push("new")
    if (product.attributes?.is_vegetarian) tags.push("veg-option")
    if (product.attributes?.is_gluten_free) tags.push("gf-option")

    return {
      slug: product.handle,
      handle: product.handle,
      name: product.title,
      description: product.description,
      price_cents: priceFromProduct(product),
      portions: product.attributes?.portions_label ?? "1 os",
      rating: product.attributes?.rating_avg ?? 4.8,
      reviews: product.attributes?.rating_count ?? 0,
      tags,
      images: (product.images && product.images.length > 0)
        ? product.images
        : [product.thumbnail ?? "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=1200&q=90"],
      contents: product.attributes?.contents ?? [],
      allergens: product.attributes?.allergens ?? [],
      cross_sells: [],
    }
  }

  // Fallback to placeholder
  return PLACEHOLDER_PRODUCTS[slug] ?? null
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return { title: "Produkt nie znaleziony" }
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.images[0]],
    },
  }
}

const TAG_LABELS: Record<string, { label: string; cls: string }> = {
  bestseller:   { label: "★ Bestseller",            cls: "bg-coal-900 text-snow-50" },
  new:          { label: "Nowość",                  cls: "bg-signal-500 text-snow-50" },
  "veg-option": { label: "🌱 Opcja wege",           cls: "bg-success-500/15 text-success-700" },
  "gf-option":  { label: "🌾 Opcja bezglutenowa",   cls: "bg-bone-200 text-coal-900" },
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  return (
    <article className="bg-paper-100">
      <nav className="max-w-7xl mx-auto px-6 lg:px-10 pt-6 text-sm text-coal-900/60">
        <Link href="/menu" className="hover:text-signal-500 inline-flex items-center gap-1">
          <ArrowLeft size={14} /> Powrót do menu
        </Link>
      </nav>

      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-10 grid lg:grid-cols-12 gap-10">
        {/* Gallery */}
        <div className="lg:col-span-6">
          <div className="relative aspect-square overflow-hidden bg-bone-200 mb-4">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            {product.tags?.includes("bestseller") && (
              <span className="absolute top-4 left-4 bg-coal-900 text-snow-50 text-xs uppercase tracking-widest font-semibold px-3 py-1.5">
                ★ Bestseller · {product.rating.toFixed(1)}
              </span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.slice(0, 4).map((img: string, i: number) => (
                <div
                  key={i}
                  className={`relative aspect-square overflow-hidden ${
                    i === 0 ? "border-2 border-signal-500" : "border border-bone-200"
                  }`}
                >
                  <Image src={img} alt="" fill sizes="20vw" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="lg:col-span-6">
          <div className="flex items-center gap-3 mb-4 text-sm">
            {product.rating > 0 && (
              <>
                <span className="text-signal-500">{"★".repeat(Math.round(product.rating))}</span>
                <span className="num">{product.rating.toFixed(1)}</span>
                {product.reviews > 0 && (
                  <span className="text-coal-900/50">({product.reviews} opinii)</span>
                )}
                <span className="text-coal-900/30">·</span>
              </>
            )}
            <span className="text-coal-900/50">Dla {product.portions}</span>
          </div>

          <h1 className="display upper-tight font-bold text-coal-900 text-4xl lg:text-5xl mb-4">{product.name}</h1>

          <p className="text-coal-900/70 leading-relaxed mb-6">{product.description}</p>

          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {product.tags.map((tag: string) => {
                const t = TAG_LABELS[tag]
                if (!t) return null
                return (
                  <span key={tag} className={`text-[10px] uppercase tracking-widest font-semibold px-2.5 py-1 ${t.cls}`}>
                    {t.label}
                  </span>
                )
              })}
            </div>
          )}

          {product.contents && product.contents.length > 0 && (
            <div className="bg-snow-50 border border-bone-200 p-5 mb-6">
              <div className="label text-signal-500 mb-3">W zestawie</div>
              <ul className="space-y-2 text-sm">
                {product.contents.map((line: string, i: number) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="text-signal-500 mt-1 flex-shrink-0">▪</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.allergens && product.allergens.length > 0 && (
            <div className="mb-8">
              <div className="label text-graphite-500 mb-2">Alergeny</div>
              <div className="flex flex-wrap gap-2 text-xs">
                {product.allergens.map((a: string) => (
                  <span key={a} className="px-2.5 py-1 bg-bone-200 text-coal-900/70 uppercase tracking-wide">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          <AddToCart product={product} />

          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            <div className="bg-snow-50 border border-bone-200 p-3">
              <Clock size={20} className="mx-auto mb-1.5 text-signal-500" strokeWidth={1.8} />
              <div className="text-xs text-coal-900/60">Zamów do 16:00</div>
              <div className="text-sm font-medium">Dostawa jutro</div>
            </div>
            <div className="bg-snow-50 border border-bone-200 p-3">
              <Truck size={20} className="mx-auto mb-1.5 text-signal-500" strokeWidth={1.8} />
              <div className="text-xs text-coal-900/60">Strefa 1</div>
              <div className="text-sm font-medium">+29 zł</div>
            </div>
            <div className="bg-snow-50 border border-bone-200 p-3">
              <CreditCard size={20} className="mx-auto mb-1.5 text-signal-500" strokeWidth={1.8} />
              <div className="text-xs text-coal-900/60">Płatność</div>
              <div className="text-sm font-medium">BLIK · Karta</div>
            </div>
          </div>

          {product.cross_sells && product.cross_sells.length > 0 && (
            <div className="mt-8 bg-signal-100 border border-signal-500/30 p-5">
              <div className="flex items-start gap-3">
                <Sparkles size={20} className="text-signal-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="label text-signal-600 mb-1">Sugestia AI</div>
                  <p className="text-sm text-coal-900/80">
                    Klienci często kupowali też:{" "}
                    {product.cross_sells.map((cs: any, i: number) => (
                      <span key={cs.slug}>
                        {i > 0 && ", "}
                        <Link href={`/produkt/${cs.slug}`} className="font-medium hover:text-signal-500 underline">
                          {cs.name}
                        </Link>{" "}
                        ({formatPrice(cs.price_cents)})
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </article>
  )
}
