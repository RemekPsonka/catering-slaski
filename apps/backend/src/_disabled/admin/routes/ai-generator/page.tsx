// @ts-nocheck
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Textarea, Button } from "@medusajs/ui"
import { Sparkles } from "@medusajs/icons"
import { useState } from "react"

const AIGeneratorPage = () => {
  const [brief, setBrief] = useState("")
  const [result, setResult] = useState<any>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const generate = async () => {
    setBusy(true)
    setErr(null)
    try {
      const res = await fetch("/store/ai/generate-menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief }),
      })
      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`)
      setResult(await res.json())
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">AI Generator menu</Heading>
        <Text className="text-ui-fg-subtle text-sm mt-1">
          Podaj brief (typ eventu, liczba gości, budżet, preferencje) — Claude wygeneruje propozycję menu.
        </Text>
      </div>
      <div className="px-6 py-4 space-y-3">
        <Textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          rows={5}
          placeholder="Przykład: integracja firmowa, 40 os, budżet 6000 PLN, mix wegańskich i mięsnych, dostawa w piątek 14:00 do biura w Katowicach."
        />
        <Button onClick={generate} isLoading={busy} disabled={!brief.trim()}>
          Wygeneruj propozycję
        </Button>
        {err && <Text className="text-rose-500">Błąd: {err}</Text>}
        {result && (
          <pre className="text-xs bg-ui-bg-subtle p-3 rounded overflow-auto max-h-[600px]">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({ label: "AI Generator", icon: Sparkles })
export default AIGeneratorPage
