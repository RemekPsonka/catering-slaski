import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Table, Badge, Button, Text } from "@medusajs/ui"
import { MapPin } from "@medusajs/icons"
import { useEffect, useState } from "react"

type Zone = {
  id: string
  name: string
  slug: string
  zone_type: "local" | "regional" | "national"
  delivery_method: string
  base_delivery_fee_cents: number
  lead_time_days: number
  cutoff_hour: number
  display_color?: string
  is_active?: boolean
}

const DeliveryZonesPage = () => {
  const [zones, setZones] = useState<Zone[] | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    fetch("/admin/delivery-zones", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .then((d) => setZones(d.delivery_zones ?? d.zones ?? []))
      .catch((e) => setErr(String(e)))
  }, [])

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4 flex items-center justify-between">
        <Heading level="h2">Strefy dostawy</Heading>
        <Button variant="secondary" size="small">+ Nowa strefa</Button>
      </div>
      <div className="px-6 py-4">
        {err && <Text className="text-rose-500">Błąd: {err}</Text>}
        {!zones && !err && <Text>Wczytuję…</Text>}
        {zones && zones.length === 0 && (
          <Text>Brak stref. Uruchom <code>pnpm seed:zones</code> w backend lub dodaj ręcznie.</Text>
        )}
        {zones && zones.length > 0 && (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Nazwa</Table.HeaderCell>
                <Table.HeaderCell>Typ</Table.HeaderCell>
                <Table.HeaderCell>Metoda</Table.HeaderCell>
                <Table.HeaderCell>Cena (PLN)</Table.HeaderCell>
                <Table.HeaderCell>Cutoff</Table.HeaderCell>
                <Table.HeaderCell>Lead (dni)</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {zones.map((z) => (
                <Table.Row key={z.id}>
                  <Table.Cell>
                    <div className="flex items-center gap-2">
                      {z.display_color && (
                        <span className="w-2 h-2 rounded-full" style={{ background: z.display_color }} />
                      )}
                      <span className="font-medium">{z.name}</span>
                      <Text className="text-ui-fg-subtle text-xs">/{z.slug}</Text>
                    </div>
                  </Table.Cell>
                  <Table.Cell><Badge>{z.zone_type}</Badge></Table.Cell>
                  <Table.Cell>{z.delivery_method}</Table.Cell>
                  <Table.Cell>{(z.base_delivery_fee_cents / 100).toFixed(2)}</Table.Cell>
                  <Table.Cell>{z.cutoff_hour}:00</Table.Cell>
                  <Table.Cell>{z.lead_time_days}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({ label: "Strefy dostawy", icon: MapPin })
export default DeliveryZonesPage
