import { model } from "@medusajs/framework/utils"

/**
 * B2B Account — konto firmy (NIP-based).
 *
 * Reprezentuje firmę zamawiającą catering — może być:
 *   - Konferencja/event jednorazowy (status=event_only)
 *   - Stała współpraca (status=active, weekly_invoice=true)
 *   - SmartLunch — pracownicy zamawiają indywidualnie, firma rozlicza zbiorczo
 */
export const B2BAccount = model.define("B2BAccount", {
  id: model.id({ prefix: "b2b" }).primaryKey(),
  name: model.text(),
  legal_name: model.text(),
  vat_number: model.text().unique(), // PL-NIP, EU-VAT
  regon: model.text().nullable(),
  krs: model.text().nullable(),
  billing_address: model.json(),
  // Default ship-to addresses (offices)
  shipping_addresses: model.json().nullable(),
  // Account manager
  primary_contact_name: model.text(),
  primary_contact_email: model.text(),
  primary_contact_phone: model.text().nullable(),
  // Plan
  account_type: model
    .enum(["one_time_event", "recurring", "smartlunch"])
    .default("recurring"),
  status: model
    .enum(["pending_verification", "active", "suspended", "closed"])
    .default("pending_verification"),
  // Billing
  invoice_frequency: model
    .enum(["per_order", "weekly", "monthly", "quarterly"])
    .default("monthly"),
  payment_terms_days: model.number().default(14),
  credit_limit_cents: model.number().nullable(),
  current_balance_cents: model.number().default(0),
  // Pricing
  custom_discount_percent: model.number().default(0),
  custom_price_list_id: model.text().nullable(),
  // SmartLunch specific
  smartlunch_subsidy_cents: model.number().nullable(),
  smartlunch_employee_limit: model.number().nullable(),
  smartlunch_max_per_day_cents: model.number().nullable(),
  // RFM / health
  lifetime_value_cents: model.number().default(0),
  orders_count: model.number().default(0),
  last_order_at: model.dateTime().nullable(),
  // Notes
  internal_notes: model.text().nullable(),
})

/**
 * B2BMember — pracownik firmy z dostępem do zamawiania.
 *
 * Linked do Medusa Customer (osoby) i B2BAccount (firmy).
 * Może być admin (zmienia adresy firm, autoryzuje subsydia) albo employee.
 */
export const B2BMember = model.define("B2BMember", {
  id: model.id({ prefix: "b2bm" }).primaryKey(),
  account_id: model.text(),
  customer_id: model.text(),
  email: model.text(),
  role: model.enum(["admin", "manager", "employee"]).default("employee"),
  // Per-pracownik daily limit (dla SmartLunch)
  daily_limit_cents: model.number().nullable(),
  // Department / cost center
  department: model.text().nullable(),
  cost_center: model.text().nullable(),
  // Status zatrudnienia
  status: model.enum(["active", "suspended", "former"]).default("active"),
  invited_at: model.dateTime(),
  activated_at: model.dateTime().nullable(),
})

/**
 * B2BInvoiceCycle — okno fakturacji zbiorczej.
 * Generator zamówień: co miesiąc/tydzień łączy wszystkie ORDER do faktury.
 */
export const B2BInvoiceCycle = model.define("B2BInvoiceCycle", {
  id: model.id({ prefix: "b2bic" }).primaryKey(),
  account_id: model.text(),
  cycle_start: model.dateTime(),
  cycle_end: model.dateTime(),
  status: model.enum(["open", "closed", "invoiced", "paid", "overdue"]).default("open"),
  order_ids: model.json().nullable(),
  total_cents: model.number().default(0),
  tax_cents: model.number().default(0),
  invoice_number: model.text().nullable(),
  invoice_pdf_url: model.text().nullable(),
  due_date: model.dateTime().nullable(),
  paid_at: model.dateTime().nullable(),
})
