/**
 * Email templates for Catering Śląski.
 * Rendered as HTML strings (inline-styled for broad client compat).
 *
 * Brand v2: Coal #0A0908, Paper #F5F2EC, Signal #E54B17.
 * Inter Tight family — falls back to Helvetica in Outlook.
 */

const COLORS = {
  coal: "#0A0908",
  paper: "#F5F2EC",
  signal: "#E54B17",
  bone: "#E8E2D5",
  snow: "#FAF7F1",
  graphite: "#6B6863",
  success: "#2D7A4F",
}

const FONT = `'Inter Tight', 'Helvetica Neue', Helvetica, Arial, sans-serif`

function wrap(title: string, preheader: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0; padding:0; background:${COLORS.paper}; font-family:${FONT}; color:${COLORS.coal};">
  <div style="display:none; max-height:0; overflow:hidden; color:transparent;">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.paper};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; background:${COLORS.snow}; border:1px solid ${COLORS.bone};">

          <!-- Header -->
          <tr>
            <td style="background:${COLORS.coal}; padding:24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="color:${COLORS.signal}; font-size:10px; letter-spacing:0.2em; text-transform:uppercase; font-weight:600;">Catering Śląski</div>
                    <div style="color:${COLORS.paper}; font-size:20px; font-weight:700; letter-spacing:-0.02em; margin-top:2px;">${title}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:${COLORS.bone}; padding:24px 32px; font-size:12px; color:${COLORS.graphite}; line-height:1.5;">
              <strong style="color:${COLORS.coal};">Nono Food sp. z o.o.</strong> · NIP 6452601594<br/>
              Dąbrowa Górnicza · obsługa: 25+ miast Śląska<br/>
              <a href="tel:+48793001900" style="color:${COLORS.signal}; text-decoration:none;">+48 793 001 900</a> · <a href="mailto:kontakt@cateringslaski.pl" style="color:${COLORS.signal}; text-decoration:none;">kontakt@cateringslaski.pl</a>
            </td>
          </tr>
        </table>

        <div style="font-size:11px; color:${COLORS.graphite}; padding:16px;">
          Otrzymujesz tę wiadomość, bo złożyłeś zamówienie w Catering Śląski.
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ============================================================================
// Order confirmation
// ============================================================================
export function renderOrderConfirmation(params: {
  orderId: string
  customerName: string
  items: Array<{ name: string; qty: number; total_cents: number }>
  subtotal_cents: number
  delivery_cents: number
  total_cents: number
  delivery_date: string
  delivery_slot: string
  address: string
  trackingUrl?: string
}): { subject: string; html: string } {
  const itemsRows = params.items
    .map(
      (i) => `
      <tr>
        <td style="padding:10px 0; border-bottom:1px solid ${COLORS.bone};">
          <div style="font-weight:500;">${escapeHtml(i.name)}</div>
          <div style="font-size:12px; color:${COLORS.graphite};">${i.qty}× </div>
        </td>
        <td align="right" style="padding:10px 0; border-bottom:1px solid ${COLORS.bone}; font-weight:600;">
          ${formatPriceHtml(i.total_cents)}
        </td>
      </tr>`
    )
    .join("")

  const content = `
    <h2 style="font-size:24px; font-weight:700; letter-spacing:-0.02em; margin:0 0 8px;">Dziękujemy, ${escapeHtml(params.customerName)}!</h2>
    <p style="color:${COLORS.graphite}; font-size:15px; line-height:1.6; margin:0 0 24px;">
      Twoje zamówienie <strong style="color:${COLORS.coal}; font-family:monospace;">${params.orderId}</strong> jest potwierdzone.
      Wysłaliśmy też SMS — kurier zadzwoni 24h przed dostawą.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.paper}; border:1px solid ${COLORS.bone}; padding:16px; margin-bottom:24px;">
      <tr><td style="font-size:12px; color:${COLORS.graphite}; text-transform:uppercase; letter-spacing:0.1em;">Termin dostawy</td></tr>
      <tr><td style="font-size:18px; font-weight:700; padding-top:4px;">${escapeHtml(params.delivery_date)} · ${escapeHtml(params.delivery_slot)}</td></tr>
      <tr><td style="font-size:13px; color:${COLORS.graphite}; padding-top:8px;">${escapeHtml(params.address)}</td></tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${itemsRows}
      <tr>
        <td style="padding:10px 0; color:${COLORS.graphite};">Wartość pozycji</td>
        <td align="right" style="padding:10px 0;">${formatPriceHtml(params.subtotal_cents)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0; color:${COLORS.graphite};">Dostawa</td>
        <td align="right" style="padding:6px 0;">${formatPriceHtml(params.delivery_cents)}</td>
      </tr>
      <tr>
        <td style="padding:12px 0 0; border-top:2px solid ${COLORS.coal}; font-weight:700; font-size:18px;">Razem</td>
        <td align="right" style="padding:12px 0 0; border-top:2px solid ${COLORS.coal}; font-weight:700; font-size:20px;">${formatPriceHtml(params.total_cents)}</td>
      </tr>
    </table>

    ${
      params.trackingUrl
        ? `<table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center">
              <a href="${params.trackingUrl}" style="display:inline-block; background:${COLORS.signal}; color:${COLORS.snow}; padding:14px 32px; text-decoration:none; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; font-size:13px;">
                Śledź zamówienie →
              </a>
            </td></tr>
          </table>`
        : ""
    }
  `

  return {
    subject: `Zamówienie ${params.orderId} potwierdzone · dostawa ${params.delivery_date}`,
    html: wrap("Zamówienie przyjęte", `Dostawa ${params.delivery_date} · ${params.delivery_slot}`, content),
  }
}

// ============================================================================
// Delivery ETA (24h before)
// ============================================================================
export function renderDeliveryEta(params: {
  customerName: string
  orderId: string
  delivery_date: string
  delivery_slot: string
  courier_name?: string
  courier_phone?: string
  trackingUrl?: string
}): { subject: string; html: string } {
  const content = `
    <h2 style="font-size:24px; font-weight:700; letter-spacing:-0.02em; margin:0 0 8px;">Dostawa już jutro</h2>
    <p style="color:${COLORS.graphite}; font-size:15px; line-height:1.6; margin:0 0 24px;">
      Cześć ${escapeHtml(params.customerName)}, Twoje zamówienie <strong style="font-family:monospace;">${params.orderId}</strong> wyrusza do Ciebie w okienku <strong>${escapeHtml(params.delivery_slot)}</strong>.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.coal}; color:${COLORS.paper}; padding:24px; margin-bottom:24px;">
      <tr>
        <td style="font-size:11px; color:${COLORS.signal}; text-transform:uppercase; letter-spacing:0.15em; padding-bottom:8px;">Twój kurier</td>
      </tr>
      <tr>
        <td style="font-size:20px; font-weight:700;">${escapeHtml(params.courier_name ?? "Zostanie przypisany")}</td>
      </tr>
      ${
        params.courier_phone
          ? `<tr><td style="padding-top:6px;"><a href="tel:${params.courier_phone}" style="color:${COLORS.signal}; text-decoration:none; font-family:monospace;">${escapeHtml(params.courier_phone)}</a></td></tr>`
          : ""
      }
    </table>

    <p style="color:${COLORS.graphite}; font-size:14px; line-height:1.6; margin:0 0 16px;">
      30 minut przed dostawą dostaniesz <strong>SMS z ETA</strong>. Jeśli musisz coś przesunąć — zadzwoń teraz.
    </p>

    ${
      params.trackingUrl
        ? `<table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center">
              <a href="${params.trackingUrl}" style="display:inline-block; background:${COLORS.signal}; color:${COLORS.snow}; padding:14px 32px; text-decoration:none; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; font-size:13px;">
                Śledź na żywo →
              </a>
            </td></tr>
          </table>`
        : ""
    }
  `

  return {
    subject: `Jutro ${params.delivery_slot} · zamówienie ${params.orderId}`,
    html: wrap("Dostawa jutro", `${params.delivery_date} · ${params.delivery_slot}`, content),
  }
}

// ============================================================================
// B2B quote follow-up
// ============================================================================
export function renderB2BQuoteFollowUp(params: {
  contactName: string
  occasion: string
  guests: number
  budget_per_person_pln: number
  quote_url: string
  agent_name: string
  agent_email: string
  agent_phone: string
}): { subject: string; html: string } {
  const content = `
    <h2 style="font-size:24px; font-weight:700; letter-spacing:-0.02em; margin:0 0 8px;">Twoja propozycja menu jest gotowa</h2>
    <p style="color:${COLORS.graphite}; font-size:15px; line-height:1.6; margin:0 0 24px;">
      Cześć ${escapeHtml(params.contactName)}, przygotowaliśmy propozycję menu na <strong>${escapeHtml(params.occasion)}</strong>
      dla <strong class="num">${params.guests}</strong> osób (${params.budget_per_person_pln} zł/os).
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr><td align="center">
        <a href="${params.quote_url}" style="display:inline-block; background:${COLORS.signal}; color:${COLORS.snow}; padding:16px 40px; text-decoration:none; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; font-size:13px;">
          Zobacz propozycję →
        </a>
      </td></tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.paper}; border:1px solid ${COLORS.bone}; padding:20px;">
      <tr>
        <td style="font-size:11px; color:${COLORS.graphite}; text-transform:uppercase; letter-spacing:0.15em; padding-bottom:8px;">Twój opiekun</td>
      </tr>
      <tr>
        <td>
          <strong style="font-size:16px;">${escapeHtml(params.agent_name)}</strong><br/>
          <a href="mailto:${params.agent_email}" style="color:${COLORS.signal}; text-decoration:none;">${escapeHtml(params.agent_email)}</a><br/>
          <a href="tel:${params.agent_phone}" style="color:${COLORS.signal}; text-decoration:none; font-family:monospace;">${escapeHtml(params.agent_phone)}</a>
        </td>
      </tr>
    </table>

    <p style="color:${COLORS.graphite}; font-size:13px; line-height:1.6; margin:24px 0 0;">
      Propozycja jest ważna <strong>14 dni</strong>. W razie pytań — zadzwoń lub odpowiedz na tego maila.
    </p>
  `

  return {
    subject: `Propozycja menu · ${params.occasion} · ${params.guests} os`,
    html: wrap("Propozycja menu gotowa", `${params.occasion} · ${params.guests} os`, content),
  }
}

// ============================================================================
// Helpers
// ============================================================================
function formatPriceHtml(cents: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

function escapeHtml(str: string | undefined | null): string {
  if (!str) return ""
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
