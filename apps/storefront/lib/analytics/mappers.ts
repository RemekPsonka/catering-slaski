/**
 * Convert app domain objects (Product, MedusaCart) to GA4-shaped Items.
 * Centralised so the tile, PDP and cart all push identical payloads.
 */
import type { Product } from "@/lib/products"
import type { Item } from "./events"

function priceFromProduct(p: Product): number {
  const cents = p.variants?.[0]?.prices?.[0]?.amount ?? 0
  return cents / 100
}

export function productToItem(p: Product, qty: number = 1, listName?: string): Item {
  return {
    item_id: p.id,
    item_name: p.title,
    item_category: (p.metadata?.category as string) ?? undefined,
    item_brand: "Catering Śląski",
    price: priceFromProduct(p),
    quantity: qty,
    portions: p.attributes?.portions_label,
    is_vegetarian: p.attributes?.is_vegetarian,
    is_gluten_free: p.attributes?.is_gluten_free,
    ...(listName ? { item_list_name: listName } : {}),
  } as Item
}

export function productsToItems(list: Product[], listName?: string): Item[] {
  return list.map((p) => productToItem(p, 1, listName))
}

/** Cart line → Item. Quantity comes from line; price uses unit_price (cents). */
export function cartLineToItem(line: {
  product_id?: string
  variant_id?: string
  title: string
  quantity: number
  unit_price: number
}): Item {
  return {
    item_id: line.product_id ?? line.variant_id ?? "unknown",
    item_name: line.title,
    item_variant: line.variant_id,
    price: (line.unit_price ?? 0) / 100,
    quantity: line.quantity ?? 1,
  }
}
