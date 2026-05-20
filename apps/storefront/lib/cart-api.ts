/**
 * Cart API — bridges local Zustand cart with Medusa server cart.
 *
 * Flow:
 *   1. User adds items to Zustand store (no server roundtrip — fast UX)
 *   2. On checkout open, create Medusa cart and sync items
 *   3. On step changes, PATCH cart with address / shipping / billing
 *   4. On payment, complete cart → order
 *
 * Cart ID persists in localStorage so refresh doesn't lose progress.
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUB_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

function headers() {
  return {
    "Content-Type": "application/json",
    ...(PUB_KEY ? { "x-publishable-api-key": PUB_KEY } : {}),
  }
}

export type MedusaCart = {
  id: string
  email?: string
  currency_code: string
  items: Array<{
    id: string
    variant_id: string
    product_id: string
    title: string
    quantity: number
    unit_price: number
    subtotal: number
  }>
  subtotal: number
  shipping_total: number
  tax_total: number
  total: number
  shipping_address?: any
  billing_address?: any
  payment_collection?: any
}

const CART_ID_KEY = "cs-medusa-cart-id"

export function getCartId(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(CART_ID_KEY)
}

export function setCartId(id: string) {
  if (typeof window === "undefined") return
  localStorage.setItem(CART_ID_KEY, id)
}

export function clearCartId() {
  if (typeof window === "undefined") return
  localStorage.removeItem(CART_ID_KEY)
}

export async function createCart(regionId?: string): Promise<MedusaCart> {
  const res = await fetch(`${BACKEND_URL}/store/carts`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ region_id: regionId || process.env.NEXT_PUBLIC_DEFAULT_REGION_ID }),
  })
  if (!res.ok) throw new Error(`Cart create failed: ${res.status}`)
  const { cart } = await res.json()
  setCartId(cart.id)
  return cart
}

export async function getCart(cartId: string): Promise<MedusaCart | null> {
  const res = await fetch(`${BACKEND_URL}/store/carts/${cartId}`, { headers: headers(), cache: "no-store" })
  if (res.status === 404) {
    clearCartId()
    return null
  }
  if (!res.ok) throw new Error(`Cart get failed: ${res.status}`)
  const { cart } = await res.json()
  return cart
}

export async function addLineItem(cartId: string, variantId: string, qty: number) {
  const res = await fetch(`${BACKEND_URL}/store/carts/${cartId}/line-items`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ variant_id: variantId, quantity: qty }),
  })
  if (!res.ok) throw new Error(`Add line item failed: ${res.status}`)
  return await res.json()
}

export async function updateLineItem(cartId: string, lineItemId: string, qty: number) {
  const res = await fetch(`${BACKEND_URL}/store/carts/${cartId}/line-items/${lineItemId}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ quantity: qty }),
  })
  if (!res.ok) throw new Error(`Update line item failed: ${res.status}`)
  return await res.json()
}

export async function removeLineItem(cartId: string, lineItemId: string) {
  const res = await fetch(`${BACKEND_URL}/store/carts/${cartId}/line-items/${lineItemId}`, {
    method: "DELETE",
    headers: headers(),
  })
  if (!res.ok) throw new Error(`Remove line item failed: ${res.status}`)
  return await res.json()
}

export async function setAddress(cartId: string, address: {
  first_name: string
  last_name: string
  email: string
  phone: string
  address_1: string
  city: string
  postal_code: string
  country_code: string
  company?: string
}) {
  const res = await fetch(`${BACKEND_URL}/store/carts/${cartId}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      email: address.email,
      shipping_address: address,
      billing_address: address,
    }),
  })
  if (!res.ok) throw new Error(`Set address failed: ${res.status}`)
  return await res.json()
}

export async function setShippingMethod(cartId: string, optionId: string) {
  const res = await fetch(`${BACKEND_URL}/store/carts/${cartId}/shipping-methods`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ option_id: optionId }),
  })
  if (!res.ok) throw new Error(`Set shipping method failed: ${res.status}`)
  return await res.json()
}

export async function initPayment(cartId: string, providerId = "stripe") {
  const res = await fetch(`${BACKEND_URL}/store/payment-collections`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ cart_id: cartId }),
  })
  if (!res.ok) throw new Error(`Init payment collection failed: ${res.status}`)
  const { payment_collection } = await res.json()

  const sessionRes = await fetch(
    `${BACKEND_URL}/store/payment-collections/${payment_collection.id}/payment-sessions`,
    {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ provider_id: providerId }),
    }
  )
  if (!sessionRes.ok) throw new Error(`Init payment session failed: ${sessionRes.status}`)
  return await sessionRes.json()
}

export async function completeCart(cartId: string) {
  const res = await fetch(`${BACKEND_URL}/store/carts/${cartId}/complete`, {
    method: "POST",
    headers: headers(),
  })
  if (!res.ok) throw new Error(`Complete cart failed: ${res.status}`)
  const data = await res.json()
  if (data.order) clearCartId() // success — start fresh next time
  return data
}
