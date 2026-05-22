// @ts-nocheck
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Table, Badge, Text } from "@medusajs/ui"
import { Star } from "@medusajs/icons"
import { useEffect, useState } from "react"

type LoyaltyAccount = {
  id: string
  customer_id: string
  points: number
  tier: "bronze" | "silver" | "gold" | "platinum"
  lifetime_spend_cents: number
}

const LoyaltyPage = () => {
  const [accounts, setAccounts] = useState<LoyaltyAccount[] | null>(null)
  const [err, setErr] = useState<string | null>(null)
  useEffect(() => {
    fetch("/admin/loyalty/accounts", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .then((d) => setAccounts(d.accounts ?? []))
      .catch((e) => setErr(String(e)))
  }, [])

  const tierColors: Record<string, "default" | "orange" | "green" | "blue"> = {
    bronze: "orange", silver: "default", gold: "green", platinum: "blue",
  }

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">Program lojalnościowy</Heading>
        <Text className="text-ui-fg-subtle text-sm mt-1">
          Punkty: 1 PLN = 1 pkt. Tiery: brąz (0+), srebro (1500 PLN+), złoto (5000 PLN+), platyna (15000 PLN+).
        </Text>
      </div>
      <div className="px-6 py-4">
        {err && <Text className="text-rose-500">Błąd: {err}</Text>}
        {!accounts && !err && <Text>Wczytuję…</Text>}
        {accounts && accounts.length === 0 && <Text>Brak kont lojalnościowych. Klienci dostają konto po pierwszym zamówieniu.</Text>}
        {accounts && accounts.length > 0 && (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Klient</Table.HeaderCell>
                <Table.HeaderCell>Tier</Table.HeaderCell>
                <Table.HeaderCell>Punkty</Table.HeaderCell>
                <Table.HeaderCell>Lifetime (PLN)</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {accounts.map((a) => (
                <Table.Row key={a.id}>
                  <Table.Cell><code className="text-xs">{a.customer_id.slice(0, 12)}</code></Table.Cell>
                  <Table.Cell><Badge color={tierColors[a.tier] ?? "default"}>{a.tier}</Badge></Table.Cell>
                  <Table.Cell>{a.points.toLocaleString("pl-PL")}</Table.Cell>
                  <Table.Cell>{(a.lifetime_spend_cents / 100).toFixed(2)}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({ label: "Lojalność", icon: Star })
export default LoyaltyPage
