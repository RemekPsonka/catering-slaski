/**
 * Seed Catering Śląski product catalog.
 *
 * Source: structured extraction from cateringslaski.pl current menu (May 2026).
 * Covers 9 categories × ~6 products = ~50 products total.
 *
 * Usage:
 *   pnpm --filter @cs/backend exec medusa exec ./src/scripts/seed-catalog.ts
 *
 * Idempotent: skips products that already exist by handle.
 */
import { ExecArgs } from "@medusajs/framework/types"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { CATERING_ATTRIBUTES_MODULE } from "../modules/catering-attributes"

type SeedProduct = {
  handle: string
  title: string
  description: string
  category: string
  price_cents: number
  thumbnail?: string
  portions_min?: number
  portions_max?: number
  portions_label?: string
  is_vegetarian?: boolean
  is_vegan?: boolean
  is_gluten_free?: boolean
  is_bestseller?: boolean
  is_new?: boolean
  allergens?: string[]
  contents?: string[]
  occasion_tags?: string[]
  season_tags?: string[]
}

const CATALOG: SeedProduct[] = [
  // ===== BOXY KOKTAJLOWE / FINGER FOOD =====
  {
    handle: "box-koktajlowy-i",
    title: "BOX koktajlowy I",
    description: "Mix mini-przekąsek na małe spotkanie. Idealny na 6-8 osób.",
    category: "catering-boxes",
    price_cents: 26000,
    portions_min: 6, portions_max: 8, portions_label: "6-8 os",
    is_bestseller: true,
    allergens: ["gluten","milk","eggs"],
    contents: [
      "16 kanapek koktajlowych (4 rodzaje)",
      "Bruschettas (12 szt)",
      "Patera serów + winogron",
      "Owoce sezonowe",
    ],
    occasion_tags: ["urodziny","biuro","kolacja"],
    season_tags: ["wiosna","lato","jesien","zima"],
  },
  {
    handle: "box-koktajlowy-ii",
    title: "BOX koktajlowy II",
    description: "Najczęściej zamawiany BOX na imprezy w domu. Mix wytrawnych mini-przekąsek dla 10-12 osób.",
    category: "catering-boxes",
    price_cents: 34000,
    portions_min: 10, portions_max: 12, portions_label: "10-12 os",
    is_bestseller: true,
    allergens: ["gluten","milk","eggs","fish"],
    contents: [
      "24 kanapki koktajlowe (4 rodzaje)",
      "Mini-tartlette z foie gras (12 szt)",
      "Patera serów + winogron + orzechów",
      "Bruschettas z pomidorem i bazylią (16 szt)",
      "Owoce sezonowe + figi suszone",
    ],
    occasion_tags: ["urodziny","wesele","komunia","biuro"],
  },
  {
    handle: "box-koktajlowy-iii",
    title: "BOX koktajlowy III",
    description: "Wersja XXL — 18-22 osoby. Pełna paleta przekąsek na duże spotkanie.",
    category: "catering-boxes",
    price_cents: 56000,
    portions_min: 18, portions_max: 22, portions_label: "18-22 os",
    allergens: ["gluten","milk","eggs","fish"],
    contents: [
      "40 kanapek koktajlowych (6 rodzajów)",
      "Mini-tartlette (20 szt)",
      "2 patery serów premium",
      "Bruschettas (30 szt)",
      "Patery owoców i orzechów",
    ],
    occasion_tags: ["wesele","komunia","firmowe","jubileusz"],
  },
  {
    handle: "box-wege",
    title: "BOX wege",
    description: "100% wegetariański mix dla 10-12 osób. Bez kompromisów na smaku.",
    category: "catering-boxes",
    price_cents: 22000,
    portions_min: 10, portions_max: 12, portions_label: "10-12 os",
    is_vegetarian: true,
    allergens: ["gluten","milk","eggs","nuts"],
    contents: [
      "Bruschettas z buraczkiem i kozim serem (16 szt)",
      "Hummus z pieczonymi warzywami",
      "Mini quiche szpinakowe (12 szt)",
      "Patera serów i owoców",
      "Tabouleh + falafel",
    ],
    occasion_tags: ["urodziny","komunia","biuro","wesele"],
  },
  {
    handle: "box-vegan",
    title: "BOX vegan",
    description: "Pełnoroślinny BOX dla 8-10 osób. Bez mleka i jajek.",
    category: "catering-boxes",
    price_cents: 24000,
    portions_min: 8, portions_max: 10, portions_label: "8-10 os",
    is_vegetarian: true, is_vegan: true,
    allergens: ["gluten","nuts"],
    contents: [
      "Falafel z tahini (24 szt)",
      "Wrapy z grilllowanymi warzywami (16 szt)",
      "Sałatka z komosy ryżowej",
      "Hummus + bruschettas pomidorowe",
      "Owoce + orzechy",
    ],
    occasion_tags: ["urodziny","biuro","wesele"],
  },
  {
    handle: "box-sweets",
    title: "BOX ze słodkościami",
    description: "Słodki finał wieczoru — mix deserów i ciastek dla 10-12 osób.",
    category: "catering-boxes",
    price_cents: 24000,
    portions_min: 10, portions_max: 12, portions_label: "10-12 os",
    is_vegetarian: true,
    allergens: ["gluten","milk","eggs","nuts"],
    contents: [
      "Mini-tartlette z owocami (16 szt)",
      "Macarons (12 szt, 4 smaki)",
      "Brownie + cheesecake (po 12 szt)",
      "Truskawki w czekoladzie",
      "Patera owoców",
    ],
    occasion_tags: ["urodziny","komunia","wesele","sylwester"],
  },
  {
    handle: "box-finger-food-premium",
    title: "BOX finger food premium",
    description: "Eleganckie mini-przekąski premium — owoce morza, foie gras, wagyu. Dla 10 osób.",
    category: "finger-food",
    price_cents: 37000,
    portions_min: 8, portions_max: 10, portions_label: "8-10 os",
    is_new: true,
    allergens: ["gluten","milk","eggs","fish","shellfish"],
    contents: [
      "Tartar z wagyu (10 szt)",
      "Mini-blinis z kawiorem (10 szt)",
      "Krewetki w panko z sosem aioli (12 szt)",
      "Foie gras na pumperniku (10 szt)",
      "Wędzony łosoś z koperkiem",
    ],
    occasion_tags: ["wesele","firmowe","jubileusz","sylwester"],
  },
  {
    handle: "box-mini-burgery",
    title: "BOX z mini burgerami",
    description: "20 mini-burgerów + frytki belgijskie + sosy. Hit dziecięcych urodzin i meczy.",
    category: "street",
    price_cents: 29000,
    portions_min: 8, portions_max: 12, portions_label: "8-12 os",
    allergens: ["gluten","milk","eggs","sesame"],
    contents: [
      "20 mini-burgerów wołowych z cheddarem",
      "Frytki belgijskie (porcja na grupę)",
      "Sosy: BBQ, aioli, miodowo-musztardowy",
      "Pikle + cebula karmelizowana",
    ],
    occasion_tags: ["urodziny","sport","biuro"],
  },

  // ===== ZIMNA PŁYTA / PATERY =====
  {
    handle: "patera-kanapek-koktajlowych",
    title: "Patera kanapek koktajlowych",
    description: "32 kanapki w 4 wariantach — łosoś, kurczak, tatar, vege. Solidny start spotkania.",
    category: "zimna-plyta",
    price_cents: 29000,
    portions_min: 10, portions_max: 14, portions_label: "10-14 os",
    allergens: ["gluten","milk","eggs","fish"],
    contents: [
      "8× kanapka z łososiem i koperkiem",
      "8× kanapka z kurczakiem currey",
      "8× kanapka z tatarem wołowym",
      "8× kanapka wegetariańska",
    ],
    occasion_tags: ["urodziny","biuro","komunia"],
  },
  {
    handle: "patera-serow-premium",
    title: "Patera serów premium",
    description: "Mix 6 serów z dodatkami — orzechy, miód, suszone owoce, krakersy.",
    category: "zimna-plyta",
    price_cents: 18000,
    portions_min: 6, portions_max: 8, portions_label: "6-8 os",
    is_vegetarian: true,
    allergens: ["milk","gluten","nuts"],
    contents: [
      "Brie, Camembert, Gorgonzola, Pecorino, Manchego, Cheddar",
      "Orzechy włoskie + migdały",
      "Miód spadziowy + dżem figowy",
      "Krakersy + grissini",
      "Winogrona + suszone morele",
    ],
    occasion_tags: ["wesele","jubileusz","sylwester","biuro"],
  },
  {
    handle: "patera-wedlin-slaskich",
    title: "Patera wędlin śląskich",
    description: "Wybór wędlin od lokalnych producentów — szynka długo dojrzewająca, salami, kabanos.",
    category: "zimna-plyta",
    price_cents: 21000,
    portions_min: 8, portions_max: 10, portions_label: "8-10 os",
    allergens: ["milk"],
    contents: [
      "Szynka długo dojrzewająca (250g)",
      "Salami śląskie (200g)",
      "Kabanosy domowe (10 szt)",
      "Pasztet z dziczyzny (150g)",
      "Marynaty: ogórek, cebulka",
      "Chleb żytni + masło",
    ],
    occasion_tags: ["komunia","jubileusz","biuro"],
  },

  // ===== KOMUNIA 2026 =====
  {
    handle: "komunia-zimna-plyta-dla-30",
    title: "Komunia · Zimna płyta dla 30 osób",
    description: "Kompletna zimna płyta na komunię. Tradycyjne dania z domowymi recepturami.",
    category: "komunia",
    price_cents: 145000,
    portions_min: 28, portions_max: 32, portions_label: "30 os",
    is_bestseller: true,
    allergens: ["gluten","milk","eggs","fish"],
    contents: [
      "Galaretka z drobiu (3 formy)",
      "Półmiski wędlin (3)",
      "Sałatka jarzynowa (3 miski)",
      "Sałatka z makaronu (3 miski)",
      "Śledzie w 3 smakach",
      "Patery serów + warzyw",
      "Chleb + masło",
    ],
    occasion_tags: ["komunia","chrzciny","jubileusz"],
  },
  {
    handle: "komunia-deska-deserowa",
    title: "Komunia · Deska deserowa premium",
    description: "Słodki stół na komunię dla 30 osób — torty, ciastka, owoce.",
    category: "komunia",
    price_cents: 78000,
    portions_min: 28, portions_max: 32, portions_label: "30 os",
    is_vegetarian: true,
    allergens: ["gluten","milk","eggs","nuts"],
    contents: [
      "Tort komunijny 5 kg (dekoracja + tabliczka z imieniem)",
      "Sernik tradycyjny (2 kg)",
      "Szarlotka (2 kg)",
      "Mix ciastek (60 szt)",
      "Patera owoców",
    ],
    occasion_tags: ["komunia","chrzciny","urodziny"],
  },

  // ===== LUNCH DNIA / FIRMOWE =====
  {
    handle: "lunch-box-standard",
    title: "Lunch box · standard",
    description: "Codzienny lunch box: zupa + danie główne + dodatek + deser. Dostawa do biura.",
    category: "lunch",
    price_cents: 3500,
    portions_min: 1, portions_max: 1, portions_label: "1 os",
    is_bestseller: true,
    allergens: ["gluten","milk","eggs"],
    contents: [
      "Zupa dnia (300ml)",
      "Danie główne (mięso/wege rotacyjnie)",
      "Dodatek skrobiowy",
      "Surówka",
      "Deser dnia",
    ],
    occasion_tags: ["biuro","lunch"],
  },
  {
    handle: "lunch-box-fit",
    title: "Lunch box · fit",
    description: "Lekka opcja: sałatka XXL + chude białko + low-carb. 450 kcal.",
    category: "lunch",
    price_cents: 3900,
    portions_min: 1, portions_max: 1, portions_label: "1 os",
    is_gluten_free: true,
    allergens: ["milk","eggs"],
    contents: [
      "Sałatka XXL (350g)",
      "Grilowany kurczak / łosoś",
      "Quinoa lub kasza gryczana",
      "Sos własny",
    ],
    occasion_tags: ["biuro","lunch","fitness"],
  },
  {
    handle: "lunch-box-vege",
    title: "Lunch box · wege",
    description: "Wegetariański lunch — pełnowartościowy bez mięsa.",
    category: "lunch",
    price_cents: 3500,
    portions_min: 1, portions_max: 1, portions_label: "1 os",
    is_vegetarian: true,
    allergens: ["gluten","milk","eggs","nuts"],
    contents: [
      "Zupa wege",
      "Curry z ciecierzycy / risotto / placki",
      "Surówka",
      "Owoce",
    ],
    occasion_tags: ["biuro","lunch"],
  },

  // ===== STREET FOOD =====
  {
    handle: "hot-dog-bar",
    title: "Hot dog bar (50 szt)",
    description: "Stacja hot-dogów na imprezę: parówki, bułki, sosy, toppingi. Sam serwujesz.",
    category: "street",
    price_cents: 45000,
    portions_min: 25, portions_max: 50, portions_label: "25-50 os",
    allergens: ["gluten","milk","eggs","mustard"],
    contents: [
      "50 parówek (premium drobiowych + wołowych)",
      "50 bułek do hot dogów",
      "Sosy: musztarda, ketchup, BBQ, aioli, czosnkowy",
      "Toppingi: cebula prażona, ogórki, jalapeño, ser cheddar",
    ],
    occasion_tags: ["urodziny","sylwester","street"],
  },
  {
    handle: "pizza-party-10-szt",
    title: "Pizza party · 10 sztuk",
    description: "10 pizz 32 cm z pieca opalanego drewnem — różne smaki do wyboru.",
    category: "street",
    price_cents: 38000,
    portions_min: 10, portions_max: 25, portions_label: "10-25 os",
    allergens: ["gluten","milk"],
    contents: [
      "10× pizza 32 cm (mix: Margherita, Diavola, Quattro Stagioni, Funghi, Hawajska)",
      "Można zamienić smaki przy zamówieniu",
    ],
    occasion_tags: ["urodziny","biuro","street"],
  },

  // ===== GARMAŻERKA =====
  {
    handle: "rolada-slaska-z-kluskami",
    title: "Rolada śląska z kluskami i modrą kapustą",
    description: "Tradycyjne danie śląskie — wołowa rolada z farszem, kluski śląskie, modra kapusta.",
    category: "garmazerka",
    price_cents: 4800,
    portions_min: 1, portions_max: 1, portions_label: "1 porcja",
    is_bestseller: true,
    allergens: ["gluten","milk","eggs"],
    contents: [
      "Rolada wołowa z farszem (180g)",
      "Kluski śląskie (5 szt)",
      "Modra kapusta (150g)",
      "Sos pieczeniowy",
    ],
    occasion_tags: ["obiad","komunia","tradycja"],
    season_tags: ["jesien","zima"],
  },
  {
    handle: "zurek-w-chlebie",
    title: "Żurek śląski w chlebie",
    description: "Żurek na zakwasie własnym z białą kiełbasą i jajkiem — serwowany w wydrążonym bochenku.",
    category: "garmazerka",
    price_cents: 2900,
    portions_min: 1, portions_max: 1, portions_label: "1 os",
    allergens: ["gluten","milk","eggs"],
    contents: [
      "Żurek na zakwasie (400ml)",
      "Biała kiełbasa (1 szt)",
      "Jajko ugotowane na twardo",
      "Chleb żytni (wydrążony)",
    ],
    occasion_tags: ["komunia","wielkanoc","obiad"],
    season_tags: ["jesien","zima","wiosna"],
  },
  {
    handle: "krupnik-wojskowy",
    title: "Krupnik wojskowy (5L)",
    description: "Solidny krupnik na żeberkach z kaszą jęczmienną i warzywami. Dla 8-10 osób.",
    category: "garmazerka",
    price_cents: 14000,
    portions_min: 8, portions_max: 10, portions_label: "8-10 os",
    allergens: ["gluten"],
    contents: [
      "5 litrów krupnika",
      "Żeberka wieprzowe + kasza jęczmienna",
      "Marchew, pietruszka, ziemniaki",
    ],
    occasion_tags: ["obiad","komunia","biuro"],
    season_tags: ["jesien","zima"],
  },
]

export default async function seedCatalog({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER) as any
  const productModule = container.resolve(Modules.PRODUCT)
  const attributesService = container.resolve(CATERING_ATTRIBUTES_MODULE) as any

  logger.info(`[seed-catalog] Starting seed of ${CATALOG.length} products`)

  let created = 0
  let skipped = 0

  for (const p of CATALOG) {
    try {
      const existing = await productModule.listProducts({ handle: p.handle }, { take: 1 })
      if (existing.length > 0) {
        skipped++
        continue
      }

      // @ts-ignore - Medusa v2 createProducts type mismatch with our seed shape
      const [product] = await productModule.createProducts([
        {
          title: p.title,
          handle: p.handle,
          description: p.description,
          status: "published",
          options: [{ title: "Wariant", values: ["Standard"] }],
          variants: [
            {
              title: "Standard",
              prices: [{ amount: p.price_cents, currency_code: "pln" }],
              manage_inventory: false,
              options: { Wariant: "Standard" },
            },
          ],
          metadata: { category: p.category },
        },
      ])

      await attributesService.upsertAttributes(product.id, {
        portions_min: p.portions_min,
        portions_max: p.portions_max,
        portions_label: p.portions_label,
        is_vegetarian: p.is_vegetarian ?? false,
        is_vegan: p.is_vegan ?? false,
        is_gluten_free: p.is_gluten_free ?? false,
        is_bestseller: p.is_bestseller ?? false,
        is_new: p.is_new ?? false,
        allergens: p.allergens ?? [],
        contents: p.contents ?? [],
        occasion_tags: p.occasion_tags ?? [],
        season_tags: p.season_tags ?? [],
      })

      created++
      logger.info(`  ✓ ${p.handle} (${(p.price_cents / 100).toFixed(0)} zł)`)
    } catch (err) {
      logger.error(`  ✗ ${p.handle}: ${(err as Error).message}`)
    }
  }

  logger.info(`[seed-catalog] Done. Created: ${created}, Skipped: ${skipped}`)
}
