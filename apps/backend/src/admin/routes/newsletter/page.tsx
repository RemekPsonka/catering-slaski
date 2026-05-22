// @ts-nocheck
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Table, Badge, Text } from "@medusajs/ui"
import { EnvelopeSolid } from "@medusajs/icons"
import { useEffect, useState } from "react"

const NewsletterPage = () => {
  const [subscribers, setSubscribers] = useState<any[] | null>(null)
  const [filter, setFilter] = useState<string>("confirmed")
  useEffect(() => {
    fetch(`/admin/newsletter?status=${filter}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setSubscribers(d.subscribers ?? []))
      .catch(() => setSubscribers([]))
  }, [filter])
  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4 flex items-center justify-between">
        <Heading level="h2">Newsletter ({subscribers?.length ?? 0})</Heading>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-ui-border-base rounded px-2 py-1 text-sm"
        >
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending (double opt-in)</option>
          <option value="unsubscribed">Unsubscribed</option>
        </select>
      </div>
      <div className="px-6 py-4">
        {!subscribers && <Text>Wczytuję…</Text>}
        {subscribers?.length === 0 && <Text>Brak subskrybentów w tym statusie.</Text>}
        {subscribers && subscribers.length > 0 && (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Email</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Źródło</Table.HeaderCell>
                <Table.HeaderCell>Confirmed</Table.HeaderCell>
                <Table.HeaderCell>Welcome code</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {subscribers.map((s) => (
                <Table.Row key={s.id}>
                  <Table.Cell>{s.email}</Table.Cell>
                  <Table.Cell>
                    <Badge color={s.status === "confirmed" ? "green" : s.status === "pending" ? "orange" : "default"}>
                      {s.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell><Text className="text-xs">{s.source ?? "—"}</Text></Table.Cell>
                  <Table.Cell>{s.confirmed_at ? new Date(s.confirmed_at).toLocaleDateString("pl-PL") : "—"}</Table.Cell>
                  <Table.Cell><code className="text-xs">{s.welcome_code ?? "—"}</code></Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>
    </Container>
  )
}
export const config = defineRouteConfig({ label: "Newsletter", icon: EnvelopeSolid })
export default NewsletterPage
