// @ts-nocheck
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

/**
 * renderPaymentCaptured — payment received, order moving to production.
 */
export function renderPaymentCaptured(params: {
  orderId: string
  customerName: string
  amountPaid_cents: number
  method?: string
}): { subject: string; html: string } {
  const fmt = (c: number) =>
    new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(c / 100)
  const subject = `Płatność zaksięgowana ✓ — zamówienie ${params.orderId}`
  const content = `
        <h1 style="margin:0 0 16px; font-size:24px; color:${COLORS.coal};">Płatność zaksięgowana</h1>
        <p style="margin:0 0 12px;">Cześć ${params.customerName},</p>
        <p style="margin:0 0 12px;">Otrzymaliśmy <strong>${fmt(params.amountPaid_cents)}</strong>${
          params.method ? ` (${params.method})` : ""
        }. Twoje zamówienie wchodzi do produkcji.</p>
        <p style="margin:0 0 12px;">Numer zamówienia: <strong>${params.orderId}</strong>.</p>
        <p style="margin:24px 0 0; color:${COLORS.graphite};">Wkrótce dostaniesz mail z dokładną godziną dostawy.</p>`
  return { subject, html: wrap(subject, "Płatność OK — gotujemy.", content) }
}

/**
 * renderOrderShipped — order is en route.
 */
export function renderOrderShipped(params: {
  orderId: string
  customerName: string
  trackingUrl?: string
  driverName?: string
  driverPhone?: string
  etaWindow?: string
}): { subject: string; html: string } {
  const subject = `W drodze! Twoje zamówienie ${params.orderId}`
  const content = `
        <h1 style="margin:0 0 16px; font-size:24px; color:${COLORS.coal};">Już jedziemy</h1>
        <p style="margin:0 0 12px;">Cześć ${params.customerName},</p>
        <p style="margin:0 0 12px;">Twoje zamówienie <strong>${params.orderId}</strong> wyruszyło z naszej kuchni.</p>
        ${params.etaWindow ? `<p style="margin:0 0 12px;"><strong>Spodziewany czas dostawy:</strong> ${params.etaWindow}</p>` : ""}
        ${
          params.driverName
            ? `<p style="margin:0 0 12px;"><strong>Kierowca:</strong> ${params.driverName}${
                params.driverPhone ? ` · ${params.driverPhone}` : ""
              }</p>`
            : ""
        }
        ${
          params.trackingUrl
            ? `<p style="margin:24px 0;"><a href="${params.trackingUrl}" style="background:${COLORS.signal}; color:#fff; padding:14px 24px; text-decoration:none; display:inline-block; font-weight:600;">Śledź dostawę</a></p>`
            : ""
        }`
  return { subject, html: wrap(subject, "Jesteśmy w drodze.", content) }
}

/**
 * renderOrderDelivered — confirmation + review CTA.
 */
export function renderOrderDelivered(params: {
  orderId: string
  customerName: string
  reviewUrl?: string
}): { subject: string; html: string } {
  const subject = `Dostarczone — zamówienie ${params.orderId}`
  const content = `
        <h1 style="margin:0 0 16px; font-size:24px; color:${COLORS.coal};">Smacznego!</h1>
        <p style="margin:0 0 12px;">Cześć ${params.customerName},</p>
        <p style="margin:0 0 12px;">Twoje zamówienie ${params.orderId} zostało dostarczone. Mamy nadzieję, że było jak należy — mocno, prosto, dobrze.</p>
        ${
          params.reviewUrl
            ? `<p style="margin:24px 0;"><a href="${params.reviewUrl}" style="background:${COLORS.signal}; color:#fff; padding:14px 24px; text-decoration:none; display:inline-block; font-weight:600;">Zostaw opinię (2 minuty)</a></p>`
            : ""
        }
        <p style="margin:24px 0 0; color:${COLORS.graphite}; font-size:13px;">Następna impreza? Zamów ponownie z poziomu <a href="${process.env.STOREFRONT_URL}/konto" style="color:${COLORS.signal};">swojego konta</a> — wszystkie adresy i ulubione już zapisane.</p>`
  return { subject, html: wrap(subject, "Dostarczone. Dziękujemy!", content) }
}

/**
 * renderAbandonedCart — gentle nudge for inactive cart after N hours.
 */
export function renderAbandonedCart(params: {
  customerName: string
  itemsCount: number
  total_cents: number
  resumeUrl: string
  discountCode?: string
}): { subject: string; html: string } {
  const fmt = (c: number) =>
    new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(c / 100)
  const subject = "Twój koszyk wciąż czeka — wróć i zamów do 16:00"
  const content = `
        <h1 style="margin:0 0 16px; font-size:24px; color:${COLORS.coal};">${params.customerName}, nie zapomnij!</h1>
        <p style="margin:0 0 12px;">Twój koszyk z <strong>${params.itemsCount} ${
          params.itemsCount === 1 ? "pozycją" : "pozycjami"
        }</strong> (${fmt(params.total_cents)}) wciąż czeka. Zamów do 16:00 — dostarczymy jutro.</p>
        ${
          params.discountCode
            ? `<p style="margin:0 0 12px; background:${COLORS.signal}1A; padding:12px 16px; border:1px solid ${COLORS.signal};">Bonus dla Ciebie: kod <strong style="color:${COLORS.signal};">${params.discountCode}</strong> — działa do końca dnia.</p>`
            : ""
        }
        <p style="margin:24px 0;"><a href="${params.resumeUrl}" style="background:${COLORS.signal}; color:#fff; padding:14px 24px; text-decoration:none; display:inline-block; font-weight:600;">Wróć do koszyka</a></p>`
  return { subject, html: wrap(subject, "Twój koszyk czeka.", content) }
}

/**
 * renderB2BLeadReceived — admin notification for inbound B2B brief.
 */
export function renderB2BLeadReceived(params: {
  company: string
  contactName: string
  email: string
  phone?: string
  briefText: string
  estimatedValue?: number
}): { subject: string; html: string } {
  const subject = `[B2B] Nowy brief: ${params.company}`
  const fmt = (c?: number) =>
    c
      ? new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(c / 100)
      : "—"
  const content = `
        <h1 style="margin:0 0 16px; font-size:24px; color:${COLORS.coal};">Nowy brief B2B</h1>
        <table cellpadding="6" cellspacing="0" style="border-collapse:collapse; font-size:14px;">
          <tr><td style="color:${COLORS.graphite};">Firma:</td><td><strong>${params.company}</strong></td></tr>
          <tr><td style="color:${COLORS.graphite};">Kontakt:</td><td>${params.contactName}</td></tr>
          <tr><td style="color:${COLORS.graphite};">E-mail:</td><td><a href="mailto:${params.email}">${params.email}</a></td></tr>
          ${params.phone ? `<tr><td style="color:${COLORS.graphite};">Telefon:</td><td>${params.phone}</td></tr>` : ""}
          <tr><td style="color:${COLORS.graphite};">Szac. wartość:</td><td><strong>${fmt(params.estimatedValue)}</strong></td></tr>
        </table>
        <p style="margin:16px 0 8px; color:${COLORS.graphite}; font-size:12px; text-transform:uppercase; letter-spacing:0.1em;">Brief</p>
        <div style="background:${COLORS.bone}; padding:14px; border-left:3px solid ${COLORS.signal}; font-size:14px; white-space:pre-wrap;">${params.briefText}</div>`
  return { subject, html: wrap(subject, "Nowy brief.", content) }
}

/**
 * renderWelcomeCustomer — new customer signup welcome.
 */
export function renderWelcomeCustomer(params: {
  customerName: string
  loginUrl: string
}): { subject: string; html: string } {
  const subject = "Witaj w Cateringu Śląskim 👋"
  const content = `
        <h1 style="margin:0 0 16px; font-size:24px; color:${COLORS.coal};">Dzień dobry, ${params.customerName}!</h1>
        <p style="margin:0 0 12px;">Konto utworzone. Tutaj zobaczysz wszystkie swoje zamówienia, zapisane adresy, subskrypcje i punkty lojalności.</p>
        <p style="margin:24px 0;"><a href="${params.loginUrl}" style="background:${COLORS.signal}; color:#fff; padding:14px 24px; text-decoration:none; display:inline-block; font-weight:600;">Przejdź do konta</a></p>
        <p style="margin:24px 0 0; color:${COLORS.graphite}; font-size:13px;">Pytania? Napisz na <a href="mailto:zamowienia@cateringslaski.pl" style="color:${COLORS.signal};">zamowienia@cateringslaski.pl</a> albo zadzwoń: <a href="tel:+48793001900" style="color:${COLORS.signal};">+48 793 001 900</a>.</p>`
  return { subject, html: wrap(subject, "Konto gotowe.", content) }
}
