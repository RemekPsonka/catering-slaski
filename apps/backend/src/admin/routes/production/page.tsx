// @ts-nocheck
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Table, Badge, Text, Button } from "@medusajs/ui"
import { Buildings } from "@medusajs/icons"
import { useEffect, useState } from "react"

type ProductionRun = {
  id?: string | null
  production_date: string
  status: string
  order_ids: string[]
  aggregated_items: Array<{ product_id: string; name: string; qty: number }>
}

const ProductionPage = () => {
  const [date, setDate] = useState(() => {
    const t = new Date()
    t.setDate(t.getDate() + 1)
    return t.toISOString().slice(0, 10)
  })
  const [run, setRun] = useState<ProductionRun | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = () => {
    setErr(null)
    fetch(`/admin/production?date=${date}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .then((d) => setRun(d.production_run))
      .catch((e) => setErr(String(e)))
  }
  useEffect(load, [date])

  const printLabels = async () => {
    setBusy(true)
    try {
      const res = await fetch(`/admin/production/labels?date=${date}`, { credentials: "include" })
      const data = await res.json()
      // Open print-friendly tab
      const html = generateLabelsHtml(data.labels)
      const w = window.open("", "_blank")
      if (w) {
        w.document.write(html)
        w.document.close()
        w.print()
      }
    } finally {
      setBusy(false)
    }
  }

  const printManifests = async () => {
    setBusy(true)
    try {
      const res = await fetch(`/admin/production/manifests?date=${date}`, { credentials: "include" })
      const data = await res.json()
      const html = generateManifestsHtml(data.slots, date)
      const w = window.open("", "_blank")
      if (w) {
        w.document.write(html)
        w.document.close()
        w.print()
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <Heading level="h2">Produkcja</Heading>
          <Text className="text-ui-fg-subtle text-sm mt-1">
            Co ugotować dzisiaj, etykiety, listy załadunkowe per okienko.
          </Text>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-ui-border-base rounded px-2 py-1 text-sm"
          />
          <Button variant="secondary" size="small" onClick={printManifests} isLoading={busy}>
            Drukuj listy załadunkowe
          </Button>
          <Button variant="secondary" size="small" onClick={printLabels} isLoading={busy}>
            Drukuj etykiety
          </Button>
        </div>
      </div>
      <div className="px-6 py-4">
        {err && <Text className="text-rose-500">Błąd: {err}</Text>}
        {!run && !err && <Text>Wczytuję…</Text>}
        {run && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <Stat label="Zamówienia" value={String(run.order_ids?.length ?? 0)} />
              <Stat label="Unikatowych dań" value={String(run.aggregated_items?.length ?? 0)} />
              <Stat
                label="Łączna ilość porcji"
                value={String((run.aggregated_items ?? []).reduce((s, x) => s + (x.qty ?? 0), 0))}
              />
            </div>
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Pozycja</Table.HeaderCell>
                  <Table.HeaderCell>Ilość</Table.HeaderCell>
                  <Table.HeaderCell>SKU</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {(run.aggregated_items ?? []).map((i) => (
                  <Table.Row key={i.product_id}>
                    <Table.Cell><strong>{i.name}</strong></Table.Cell>
                    <Table.Cell><Badge size="large">{i.qty}×</Badge></Table.Cell>
                    <Table.Cell><code className="text-xs text-ui-fg-subtle">{i.product_id}</code></Table.Cell>
                  </Table.Row>
                ))}
                {(run.aggregated_items ?? []).length === 0 && (
                  <Table.Row>
                    <Table.Cell colSpan={3}>
                      <Text className="text-ui-fg-subtle">Brak potwierdzonych zamówień na {date}.</Text>
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table>
          </>
        )}
      </div>
    </Container>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-ui-bg-subtle border border-ui-border-base rounded p-3">
      <div className="text-xs uppercase text-ui-fg-subtle tracking-wide">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  )
}

function generateLabelsHtml(labels: any[]): string {
  const css = `
    @page { size: 60mm 40mm; margin: 2mm; }
    body { font-family: -apple-system, sans-serif; margin:0; padding:0; }
    .label { width: 60mm; height: 40mm; box-sizing: border-box; padding: 2mm; page-break-after: always; border: 1px dashed #ccc; }
    .order { font-size: 8pt; color: #666; }
    .customer { font-size: 10pt; font-weight: 700; }
    .product { font-size: 11pt; font-weight: 600; margin-top: 1mm; }
    .allergens { font-size: 7pt; color: #c00; margin-top: 1mm; font-weight: 600; }
    .meta { font-size: 7pt; color: #666; margin-top: 1mm; }
  `
  const items = labels
    .map(
      (l) => `
    <div class="label">
      <div class="order">${l.order_display_id} · ${l.delivery_slot}</div>
      <div class="customer">${l.customer_name}</div>
      <div class="product">${l.product_name} × ${l.portions}</div>
      ${l.allergens?.length ? `<div class="allergens">⚠ ${l.allergens.join(", ")}</div>` : ""}
      ${l.calories ? `<div class="meta">${l.calories} kcal</div>` : ""}
    </div>`,
    )
    .join("")
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${items}</body></html>`
}

function generateManifestsHtml(slots: any[], date: string): string {
  const css = `
    body { font-family: -apple-system, sans-serif; margin: 20px; }
    h1 { margin: 0 0 8px; font-size: 18pt; }
    h2 { margin: 24px 0 8px; font-size: 14pt; background: #000; color: #fff; padding: 6px 10px; }
    table { width: 100%; border-collapse: collapse; font-size: 9pt; }
    th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; vertical-align: top; }
    th { background: #f5f2ec; }
    .total { background: #fafafa; font-weight: 600; }
    @media print { .no-print { display: none; } }
  `
  const sections = slots
    .map(
      (s: any) => `
    <h2>${s.slot} — ${s.total_stops} przystanków</h2>
    <table>
      <thead>
        <tr><th>#</th><th>Zamówienie</th><th>Klient</th><th>Adres</th><th>Telefon</th><th>Pozycje</th><th>Kwota</th><th>Notatki</th></tr>
      </thead>
      <tbody>
        ${s.stops
          .map(
            (stop: any, i: number) => `
          <tr>
            <td>${i + 1}</td>
            <td>${stop.display_id ?? stop.order_id.slice(0, 8)}</td>
            <td><strong>${stop.customer_name}</strong></td>
            <td>${stop.address_1}, ${stop.postal_code} ${stop.city}</td>
            <td>${stop.phone}</td>
            <td>${stop.items.map((i: any) => `${i.qty}× ${i.name}`).join("<br>")}</td>
            <td>${(stop.total_cents / 100).toFixed(2)} zł</td>
            <td>${stop.notes ?? ""}</td>
          </tr>`,
          )
          .join("")}
      </tbody>
    </table>`,
    )
    .join("")
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head>
    <body>
      <h1>Listy załadunkowe — ${date}</h1>
      <p class="no-print">Catering Śląski — wydruk dla kierowców</p>
      ${sections}
    </body></html>`
}

export const config = defineRouteConfig({ label: "Produkcja", icon: Buildings })
export default ProductionPage
