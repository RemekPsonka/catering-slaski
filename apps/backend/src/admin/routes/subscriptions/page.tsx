// @ts-nocheck
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Table, Badge, Text, Button } from "@medusajs/ui"
import { ArrowPath } from "@medusajs/icons"
import { useEffect, useState } from "react"

type Sub = {
  id: string
  customer_id?: string
  plan_code?: string
  plan_name?: string
  status: "active" | "paused" | "cancelled" | "expired"
  next_run_at?: string
  total_value_cents?: number
}

const SubscriptionsPage = () => {
  const [subs, setSubs] = useState<Sub[] | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [running, setRunning] = useState(false)

  const load = () => {
    fetch("/admin/subscriptions", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .then((d) => setSubs(d.subscriptions ?? []))
      .catch((e) => setErr(String(e)))
  }
  useEffect(load, [])

  const runNow = async () => {
    setRunning(true)
    try {
      await fetch("/admin/subscriptions/generate-orders", { method: "POST", credentials: "include" })
      load()
    } finally {
      setRunning(false)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4 flex items-center justify-between">
        <Heading level="h2">Subskrypcje</Heading>
        <Button variant="secondary" size="small" onClick={runNow} isLoading={running}>
          Uruchom generator zamówień
        </Button>
      </div>
      <div className="px-6 py-4">
        {err && <Text className="text-rose-500">Błąd: {err}</Text>}
        {!subs && !err && <Text>Wczytuję…</Text>}
        {subs && subs.length === 0 && <Text>Brak subskrypcji.</Text>}
        {subs && subs.length > 0 && (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Plan</Table.HeaderCell>
                <Table.HeaderCell>Klient</Table.HeaderCell>
                <Table.HeaderCell>Następny przebieg</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Wartość (PLN)</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {subs.map((s) => (
                <Table.Row key={s.id}>
                  <Table.Cell>
                    <div className="font-medium">{s.plan_name ?? s.plan_code ?? "—"}</div>
                    <Text className="text-ui-fg-subtle text-xs">{s.plan_code}</Text>
                  </Table.Cell>
                  <Table.Cell><code className="text-xs">{s.customer_id?.slice(0, 12)}</code></Table.Cell>
                  <Table.Cell>{s.next_run_at ? new Date(s.next_run_at).toLocaleString("pl-PL") : "—"}</Table.Cell>
                  <Table.Cell>
                    <Badge color={s.status === "active" ? "green" : s.status === "paused" ? "orange" : "red"}>
                      {s.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>{((s.total_value_cents ?? 0) / 100).toFixed(2)}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({ label: "Subskrypcje", icon: ArrowPath })
export default SubscriptionsPage
