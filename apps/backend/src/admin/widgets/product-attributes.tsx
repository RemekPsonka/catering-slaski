// @ts-nocheck
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Badge, Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

type Attr = {
  is_vegetarian?: boolean
  is_vegan?: boolean
  is_gluten_free?: boolean
  is_bestseller?: boolean
  is_new?: boolean
  portions_label?: string
  allergens?: string[]
  occasion_tags?: string[]
}

/**
 * Side widget on /admin/products/:id — shows catering-attributes summary.
 * Edit happens through "Edytuj atrybuty" button (opens drawer — TODO).
 */
const ProductAttributesWidget = ({ data }: { data: { id: string } }) => {
  const [attr, setAttr] = useState<Attr | null>(null)
  const [err, setErr] = useState<string | null>(null)
  useEffect(() => {
    if (!data?.id) return
    fetch(`/admin/catering-attributes/${data.id}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .then((d) => setAttr(d.attributes ?? d.attribute ?? null))
      .catch((e) => setErr(String(e)))
  }, [data?.id])

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">Atrybuty cateringowe</Heading>
      </div>
      <div className="px-6 py-4 space-y-2">
        {err && <Text className="text-ui-fg-subtle text-xs">Brak rekordu — kliknij "Dodaj atrybuty", żeby utworzyć.</Text>}
        {attr && (
          <>
            <div className="flex flex-wrap gap-1.5">
              {attr.is_bestseller && <Badge color="orange">★ Bestseller</Badge>}
              {attr.is_new && <Badge color="green">Nowość</Badge>}
              {attr.is_vegetarian && <Badge color="green">🌱 Wege</Badge>}
              {attr.is_vegan && <Badge color="green">🌱 Vegan</Badge>}
              {attr.is_gluten_free && <Badge color="default">🌾 Bez glutenu</Badge>}
            </div>
            {attr.portions_label && (
              <Text className="text-sm">Porcje: <strong>{attr.portions_label}</strong></Text>
            )}
            {attr.allergens && attr.allergens.length > 0 && (
              <Text className="text-xs text-ui-fg-subtle">
                Alergeny: {attr.allergens.join(", ")}
              </Text>
            )}
          </>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.side.after",
})
export default ProductAttributesWidget
