// @ts-nocheck
import { MedusaService } from "@medusajs/framework/utils"
import { ProductAttribute } from "./models/product-attribute"

type AttributeFilter = {
  is_vegetarian?: boolean
  is_vegan?: boolean
  is_gluten_free?: boolean
  portions_min?: number
  portions_max?: number
  occasion?: string
  bestseller?: boolean
}

class CateringAttributesService extends MedusaService({
  ProductAttribute,
}) {
  /**
   * Find product attributes by filter — used by storefront /menu for category + dietary filtering.
   * Returns product_id list that match — to be intersected with Medusa product query.
   */
  async filterProductIds(filter: AttributeFilter): Promise<string[]> {
    const where: any = {}
    if (filter.is_vegetarian !== undefined) where.is_vegetarian = filter.is_vegetarian
    if (filter.is_vegan !== undefined) where.is_vegan = filter.is_vegan
    if (filter.is_gluten_free !== undefined) where.is_gluten_free = filter.is_gluten_free
    if (filter.bestseller) where.is_bestseller = true
    if (filter.portions_min !== undefined) where.portions_max = { $gte: filter.portions_min }
    if (filter.portions_max !== undefined) where.portions_min = { $lte: filter.portions_max }

    const attrs = await this.listProductAttributes(where, { take: 500 })

    // Occasion filter — JSON contains check
    let filtered = attrs
    if (filter.occasion) {
      filtered = attrs.filter((a) => {
        const tags = ((a.occasion_tags as any) as string[] | null) ?? []
        return tags.includes(filter.occasion!)
      })
    }

    return filtered.map((a) => a.product_id)
  }

  /**
   * Upsert attributes for a product — called from admin or migration scripts.
   */
  async upsertAttributes(productId: string, data: Partial<typeof ProductAttribute>) {
    const existing = await this.listProductAttributes({ product_id: productId }, { take: 1 })
    if (existing.length > 0) {
      return this.updateProductAttributes({ id: existing[0].id, ...data })
    }
    return this.createProductAttributes({ product_id: productId, ...data })
  }

  /**
   * Get cross-sell product IDs for a given product.
   */
  async getCrossSells(productId: string): Promise<string[]> {
    const [attr] = await this.listProductAttributes({ product_id: productId }, { take: 1 })
    if (!attr) return []
    return ((attr.cross_sell_ids as any) as string[] | null) ?? []
  }

  /**
   * Update rating after order review.
   */
  async recordRating(productId: string, rating: number) {
    const [attr] = await this.listProductAttributes({ product_id: productId }, { take: 1 })
    if (!attr) return null

    const currentCount = attr.rating_count ?? 0
    const currentAvg = attr.rating_avg ?? 0
    const newCount = currentCount + 1
    const newAvg = (currentAvg * currentCount + rating) / newCount

    return this.updateProductAttributes({
      id: attr.id,
      rating_avg: Math.round(newAvg * 10) / 10,
      rating_count: newCount,
    })
  }
}

export default CateringAttributesService
