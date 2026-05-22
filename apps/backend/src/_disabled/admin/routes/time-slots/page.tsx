// @ts-nocheck
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Table, Badge, Text, Select, Button } from "@medusajs/ui"
import { Clock } from "@medusajs/icons"
import { useEffect, useState } from "react"

type Slot = {
  id: string
  slot_date: string
  time_from: string
  time_to: string
  capacity: number
  booked_count: number
  status: "open" | "full" | "blocked" | "closed"
  zone_id?: string
}

const TimeSlotsPage = () => {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [slots, setSlots] = useState<Slot[] | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/admin/time-slots?date=${date}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .then((d) => setSlots(d.time_slots ?? d.slots ?? []))
      .catch((e) => setErr(String(e)))
  }, [date])

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4 flex items-center justify-between gap-3">
        <Heading level="h2">Sloty dostaw</Heading>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-ui-border-base rounded px-2 py-1 text-sm"
          />
          <Button variant="secondary" size="small">+ Wygeneruj sloty</Button>
        </div>
      </div>
      <div className="px-6 py-4">
        {err && <Text className="text-rose-500">Błąd: {err}</Text>}
        {!slots && !err && <Text>Wczytuję…</Text>}
        {slots && slots.length === 0 && <Text>Brak slotów na {date}.</Text>}
        {slots && slots.length > 0 && (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Godzina</Table.HeaderCell>
                <Table.HeaderCell>Strefa</Table.HeaderCell>
                <Table.HeaderCell>Pojemność</Table.HeaderCell>
                <Table.HeaderCell>Zarezerwowane</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {slots.map((s) => {
                const filled = (s.booked_count / Math.max(s.capacity, 1)) * 100
                const variant: "default" | "red" | "orange" | "green" =
                  s.status === "open" ? "green" : s.status === "full" ? "orange" : "red"
                return (
                  <Table.Row key={s.id}>
                    <Table.Cell>{s.time_from} – {s.time_to}</Table.Cell>
                    <Table.Cell>{s.zone_id?.slice(0, 8) ?? "—"}</Table.Cell>
                    <Table.Cell>{s.capacity}</Table.Cell>
                    <Table.Cell>{s.booked_count} ({filled.toFixed(0)}%)</Table.Cell>
                    <Table.Cell><Badge color={variant}>{s.status}</Badge></Table.Cell>
                  </Table.Row>
                )
              })}
            </Table.Body>
          </Table>
        )}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({ label: "Sloty dostaw", icon: Clock })
export default TimeSlotsPage
