import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Table, Badge, Text, Input, Textarea, Button } from "@medusajs/ui"
import { GlobeEurope } from "@medusajs/icons"
import { useEffect, useState } from "react"

type SeoMeta = {
  id: string
  path: string
  title?: string
  description?: string
  og_image?: string
  robots?: string
  is_active: boolean
  updated_at?: string
}

const SeoMetaPage = () => {
  const [items, setItems] = useState<SeoMeta[] | null>(null)
  const [editing, setEditing] = useState<Partial<SeoMeta> | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    fetch("/admin/seo-meta?limit=200", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .then((d) => setItems(d.seo_metas ?? []))
      .catch((e) => setErr(String(e)))
  }
  useEffect(load, [])

  const save = async () => {
    if (!editing?.path) return
    setSaving(true)
    try {
      await fetch("/admin/seo-meta", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      })
      setEditing(null)
      load()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4 flex items-center justify-between">
        <Heading level="h2">SEO — meta tagi</Heading>
        <Button variant="secondary" size="small" onClick={() => setEditing({ path: "", is_active: true })}>
          + Nowy override
        </Button>
      </div>

      {editing && (
        <div className="px-6 py-4 bg-ui-bg-subtle space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1">Path (np. /menu albo /produkt/zurek-slaski)</label>
            <Input value={editing.path ?? ""} onChange={(e) => setEditing({ ...editing, path: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Title (max 60 znaków)</label>
              <Input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Robots</label>
              <Input
                value={editing.robots ?? ""}
                placeholder="index,follow"
                onChange={(e) => setEditing({ ...editing, robots: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Description (max 160 znaków)</label>
            <Textarea
              value={editing.description ?? ""}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              rows={2}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">OG Image URL</label>
            <Input
              value={editing.og_image ?? ""}
              placeholder="https://…"
              onChange={(e) => setEditing({ ...editing, og_image: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={save} isLoading={saving}>Zapisz</Button>
            <Button variant="secondary" onClick={() => setEditing(null)}>Anuluj</Button>
          </div>
        </div>
      )}

      <div className="px-6 py-4">
        {err && <Text className="text-rose-500">Błąd: {err}</Text>}
        {!items && !err && <Text>Wczytuję…</Text>}
        {items && items.length === 0 && (
          <Text>Brak override'ów. Domyślne metadata są w kodzie storefrontu.</Text>
        )}
        {items && items.length > 0 && (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Path</Table.HeaderCell>
                <Table.HeaderCell>Title</Table.HeaderCell>
                <Table.HeaderCell>Robots</Table.HeaderCell>
                <Table.HeaderCell>Aktywny</Table.HeaderCell>
                <Table.HeaderCell></Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {items.map((s) => (
                <Table.Row key={s.id}>
                  <Table.Cell><code className="text-xs">{s.path}</code></Table.Cell>
                  <Table.Cell>{s.title ?? <Text className="text-ui-fg-subtle">(domyślne)</Text>}</Table.Cell>
                  <Table.Cell><Text className="text-xs">{s.robots ?? "index,follow"}</Text></Table.Cell>
                  <Table.Cell><Badge color={s.is_active ? "green" : "default"}>{s.is_active ? "tak" : "nie"}</Badge></Table.Cell>
                  <Table.Cell>
                    <Button size="small" variant="secondary" onClick={() => setEditing(s)}>Edytuj</Button>
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

export const config = defineRouteConfig({ label: "SEO meta", icon: GlobeEurope })
export default SeoMetaPage
