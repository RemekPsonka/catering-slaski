import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Badge, Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

const CustomerLoyaltyWidget = ({ data }: { data: { id: string } }) => {
  const [account, setAccount] = useState<any>(null)
  useEffect(() => {
    if (!data?.id) return
    fetch(`/admin/loyalty/accounts?customer_id=${data.id}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .then((d) => setAccount(d.accounts?.[0] ?? null))
      .catch(() => {})
  }, [data?.id])

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">Lojalność</Heading>
      </div>
      <div className="px-6 py-4">
        {!account && <Text className="text-ui-fg-subtle text-xs">Klient jeszcze bez konta lojalnościowego.</Text>}
        {account && (
          <div className="space-y-2">
            <Badge color={account.tier === "platinum" ? "blue" : account.tier === "gold" ? "green" : "orange"}>
              {account.tier.toUpperCase()}
            </Badge>
            <Text className="text-sm">Punkty: <strong>{account.points?.toLocaleString("pl-PL") ?? 0}</strong></Text>
            <Text className="text-xs text-ui-fg-subtle">
              Lifetime spend: {((account.lifetime_spend_cents ?? 0) / 100).toFixed(2)} zł
            </Text>
          </div>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({ zone: "customer.details.side.after" })
export default CustomerLoyaltyWidget
