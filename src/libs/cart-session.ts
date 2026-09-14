import { createHmac, timingSafeEqual } from 'node:crypto'

import type { CartSession, CartSessionItem } from '@/types/cart'

const CART_COOKIE_NAME = 'shopco-cart'
const MAX_CART_ITEMS = 50
const MAX_ITEM_QUANTITY = 99

class CartSessionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CartSessionError'
  }
}

const getSignature = (value: string, secret: string) =>
  createHmac('sha256', secret).update(value).digest('base64url')

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const normalizeCartItems = (value: unknown): CartSessionItem[] => {
  if (!Array.isArray(value)) throw new CartSessionError('Cart items must be an array.')
  if (value.length > MAX_CART_ITEMS) {
    throw new CartSessionError(`Cart cannot contain more than ${MAX_CART_ITEMS} items.`)
  }

  const quantities = new Map<string, CartSessionItem>()

  for (const candidate of value) {
    if (!isRecord(candidate)) throw new CartSessionError('Cart item is invalid.')

    const productId = candidate.productId
    const quantity = candidate.quantity
    const variantId = candidate.variantId ?? null
    if (!Number.isInteger(productId) || Number(productId) <= 0) {
      throw new CartSessionError('Product ID must be a positive integer.')
    }
    if (!Number.isInteger(quantity) || Number(quantity) < 1 || Number(quantity) > MAX_ITEM_QUANTITY) {
      throw new CartSessionError(`Quantity must be between 1 and ${MAX_ITEM_QUANTITY}.`)
    }
    if (variantId !== null && (typeof variantId !== 'string' || variantId.length > 100)) {
      throw new CartSessionError('Variant ID is invalid.')
    }

    const item = {
      productId: Number(productId),
      quantity: Number(quantity),
      variantId,
    }
    const key = `${item.productId}:${item.variantId ?? 'default'}`
    const existing = quantities.get(key)
    const combinedQuantity = (existing?.quantity ?? 0) + item.quantity
    if (combinedQuantity > MAX_ITEM_QUANTITY) {
      throw new CartSessionError(`Quantity must be between 1 and ${MAX_ITEM_QUANTITY}.`)
    }

    quantities.set(key, { ...item, quantity: combinedQuantity })
  }

  return [...quantities.values()]
}

const encodeCartSession = (items: CartSessionItem[], secret: string, durationMinutes: number) => {
  const session: CartSession = {
    expiresAt: new Date(Date.now() + durationMinutes * 60_000).toISOString(),
    items: normalizeCartItems(items),
  }
  const value = Buffer.from(JSON.stringify(session)).toString('base64url')

  return `${value}.${getSignature(value, secret)}`
}

const decodeCartSession = (cookieValue: null | string | undefined, secret: string): CartSessionItem[] => {
  if (!cookieValue) return []

  const [value, signature, ...rest] = cookieValue.split('.')
  if (!value || !signature || rest.length > 0) return []

  const expected = Buffer.from(getSignature(value, secret))
  const received = Buffer.from(signature)
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return []

  try {
    const session = JSON.parse(Buffer.from(value, 'base64url').toString()) as unknown
    if (!isRecord(session) || typeof session.expiresAt !== 'string') return []
    if (new Date(session.expiresAt).getTime() <= Date.now()) return []

    return normalizeCartItems(session.items)
  } catch {
    return []
  }
}

const getCookieValue = (cookieHeader: null | string, name = CART_COOKIE_NAME) =>
  cookieHeader
    ?.split(';')
    .map((part) => part.trim().split('='))
    .find(([key]) => key === name)
    ?.slice(1)
    .join('=')

const createCartCookie = (
  items: CartSessionItem[],
  secret: string,
  durationMinutes: number,
) => {
  const maxAge = Math.max(60, Math.floor(durationMinutes * 60))
  const value = encodeCartSession(items, secret, durationMinutes)

  return `${CART_COOKIE_NAME}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
}

const clearCartCookie = () =>
  `${CART_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`

export {
  CART_COOKIE_NAME,
  CartSessionError,
  clearCartCookie,
  createCartCookie,
  decodeCartSession,
  encodeCartSession,
  getCookieValue,
  normalizeCartItems,
}
