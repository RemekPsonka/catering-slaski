import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Table, Badge, Text } from "@medusajs/ui"
import { BuildingsTax } from "@medusajs/icons"
import { useEffect, useState } from "react"

const B2BAccountsPage = () => {
  const [accounts, setAccounts] = useState<any[] | null>(null)
  useEffect(() => {
    fetch("/admin/b2b-accounts", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setAccounts(d.b2b_accounts ?? []))
      .catch(() => setAccounts([]))
  }, [])
  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">Konta firmowe (B2B)</Heading>
        <Text className="text-ui-fg-subtle text-sm mt-1">
          NIP, dofinansowanie SmartLunch, faktura zbiorcza.
        </Text>
      </div>
      <div className="px-6 py-4">
        {!accounts && <Text>Wczytuję…</Text>}
        {accounts?.length === 0 && <Text>Brak. Konto zakłada się przez /store/b2b-leads + admin approve.</Text>}
        {accounts && accounts.length > 0 && (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Firma</Table.HeaderCell>
                <Table.HeaderCell>NIP</Table.HeaderCell>
                <Table.HeaderCell>Typ</Table.HeaderCell>
                <Table.HeaderCell>Faktura</Table.HeaderCell>
                <Table.HeaderCell>LTV (PLN)</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {accounts.map((a) => (
                <Table.Row key={a.id}>
                  <Table.Cell><strong>{a.name}</strong></Table.Cell>
                  <Table.Cell><code className="text-xs">{a.vat_number}</code></Table.Cell>
                  <Table.Cell><Badge>{a.account_type}</Badge></Table.Cell>
                  <Table.Cell>{a.invoice_frequency} (+{a.payment_terms_days}d)</Table.Cell>
                  <Table.Cell>{((a.lifetime_value_cents ?? 0) / 100).toFixed(0)}</Table.Cell>
                  <Table.Cell>
                    <Badge color={a.status === "active" ? "green" : a.status === "suspended" ? "orange" : "default"}>
                      {a.status}
                    </Badge>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>
    </Container>
  )
}
export const config = defineRouteConfig({ label: "Konta B2B", icon: BuildingsTax })
export default B2BAccountsPage
