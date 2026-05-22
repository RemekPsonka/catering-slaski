// @ts-nocheck
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Table, Badge, Text } from "@medusajs/ui"
import { Truck } from "@medusajs/icons"
import { useEffect, useState } from "react"

const DeliveryMethodsPage = () => {
  const [methods, setMethods] = useState<any[] | null>(null)
  useEffect(() => {
    fetch("/admin/delivery-methods", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setMethods(d.delivery_methods ?? []))
  }, [])
  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">Sposoby dostawy</Heading>
        <Text className="text-ui-fg-subtle text-sm mt-1">
          Globalny katalog sposobów. Każda strefa wskazuje, które obsługuje.
        </Text>
      </div>
      <div className="px-6 py-4">
        {!methods && <Text>Wczytuję…</Text>}
        {methods && methods.length === 0 && (
          <Text>Brak. Uruchom <code>pnpm exec medusa exec ./src/scripts/seed-delivery-methods.ts</code>.</Text>
        )}
        {methods && methods.length > 0 && (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Kod</Table.HeaderCell>
                <Table.HeaderCell>Nazwa</Table.HeaderCell>
                <Table.HeaderCell>Koszt (PLN)</Table.HeaderCell>
                <Table.HeaderCell>Cut-off</Table.HeaderCell>
                <Table.HeaderCell>Lead</Table.HeaderCell>
                <Table.HeaderCell>Termoboks</Table.HeaderCell>
                <Table.HeaderCell>Same-day</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {methods.map((m) => (
                <Table.Row key={m.id}>
                  <Table.Cell><code className="text-xs">{m.code}</code></Table.Cell>
                  <Table.Cell><strong>{m.name}</strong></Table.Cell>
                  <Table.Cell>{(m.default_cost_cents / 100).toFixed(2)}</Table.Cell>
                  <Table.Cell>{m.default_cutoff_hour}:00</Table.Cell>
                  <Table.Cell>{m.default_lead_time_days}d</Table.Cell>
                  <Table.Cell>{m.requires_thermal_packaging ? "❄️" : ""}</Table.Cell>
                  <Table.Cell>{m.supports_same_day ? "✅" : ""}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>
    </Container>
  )
}
export const config = defineRouteConfig({ label: "Sposoby dostawy", icon: Truck })
export default DeliveryMethodsPage
