// @vitest-environment node

import { createLocalReq, getPayload, type Payload, type PayloadRequest } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { resolveCart } from '@/libs/cart-resolver'
import {
  decodeCartSession,
  encodeCartSession,
  normalizeCartItems,
} from '@/libs/cart-session'
import { CheckoutError, checkout } from '@/libs/checkout'
import type { Product, Promotion } from '@/payload-types'
import config from '@/payload.config'
import { seedShopco } from '@/seed/seed-shopco'
import type { CheckoutInput } from '@/types/cart'

describe.sequential('storefront cart and checkout', () => {
  let originalPromotionUsedCount = 0
  let originalVariants: NonNullable<Product['variants']>
  let payload: Payload
  let product: Product
  let promotion: Promotion

  const uniqueKey = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const checkoutInput = (overrides: Partial<CheckoutInput> = {}): CheckoutInput => ({
    customer: {
      email: `checkout-${uniqueKey}@example.com`,
      name: 'Checkout Integration Customer',
    },
    deliveryMethod: 'standard',
    idempotencyKey: `checkout-${uniqueKey}`,
    paymentProvider: 'manual',
    shippingAddress: {
      city: 'Jakarta',
      country: 'Indonesia',
      line1: 'Jl. Checkout No. 1',
      postalCode: '10110',
      province: 'DKI Jakarta',
      recipientName: 'Checkout Integration Customer',
    },
    ...overrides,
  })
  const createRequest = (): Promise<PayloadRequest> =>
    createLocalReq({ urlSuffix: '/api/storefront/checkout' }, payload)

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    await seedShopco(payload)

    const products = await payload.find({
      collection: 'products',
      depth: 0,
      limit: 1,
      pagination: false,
      where: { slug: { equals: 'one-life-graphic-t-shirt' } },
    })
    const promotions = await payload.find({
      collection: 'promotions',
      depth: 0,
      limit: 1,
      pagination: false,
      where: { code: { equals: 'SHOPCO20' } },
    })
    product = products.docs[0] as Product
    promotion = promotions.docs[0] as Promotion
    originalVariants = structuredClone(product.variants ?? [])
    originalPromotionUsedCount = promotion.usedCount
  }, 60_000)

  afterAll(async () => {
    if (!payload || !product || !promotion) return

    await payload.delete({
      collection: 'orders',
      where: { idempotencyKey: { contains: uniqueKey } },
    })
    await payload.update({
      collection: 'products',
      id: product.id,
      data: { variants: originalVariants },
      draft: false,
    })
    await payload.update({
      collection: 'promotions',
      id: promotion.id,
      data: { usedCount: originalPromotionUsedCount },
    })
  })

  it('stores only normalized references in the signed cart session and ignores client prices', async () => {
    const variant = originalVariants[0]!
    const items = normalizeCartItems([
      {
        price: 0.01,
        productId: product.id,
        quantity: 2,
        variantId: variant.id,
      },
    ])
    const encoded = encodeCartSession(items, 'integration-secret', 30)
    const decoded = decodeCartSession(encoded, 'integration-secret')
    const cart = await resolveCart(payload, decoded)

    expect(decoded).toEqual([
      { productId: product.id, quantity: 2, variantId: variant.id },
    ])
    expect(decoded[0]).not.toHaveProperty('price')
    expect(cart.items[0]?.price).toBe(variant.priceOverride ?? product.price)
    expect(decodeCartSession(`${encoded}tampered`, 'integration-secret')).toEqual([])
  })

  it('rejects invalid promotions and rolls inventory back', async () => {
    const variant = originalVariants[0]!
    const beforeStock = variant.stock
    const req = await createRequest()

    await expect(
      checkout(
        req,
        [{ productId: product.id, quantity: 1, variantId: variant.id ?? null }],
        checkoutInput({
          idempotencyKey: `invalid-promo-${uniqueKey}`,
          promoCode: 'NOT-A-PROMOTION',
        }),
      ),
    ).rejects.toMatchObject({ code: 'invalidPromo' } satisfies Partial<CheckoutError>)

    const unchanged = await payload.findByID({ collection: 'products', id: product.id, depth: 0 })
    expect(unchanged.variants?.find(({ id }) => id === variant.id)?.stock).toBe(beforeStock)
  })

  it('rejects insufficient stock without creating an order', async () => {
    const variant = originalVariants[0]!
    const idempotencyKey = `insufficient-stock-${uniqueKey}`

    await expect(
      checkout(
        await createRequest(),
        [
          {
            productId: product.id,
            quantity: variant.stock + 1,
            variantId: variant.id ?? null,
          },
        ],
        checkoutInput({ idempotencyKey }),
      ),
    ).rejects.toMatchObject({
      code: 'insufficientStock',
      status: 409,
    } satisfies Partial<CheckoutError>)

    const orders = await payload.count({
      collection: 'orders',
      where: { idempotencyKey: { equals: idempotencyKey } },
    })
    expect(orders.totalDocs).toBe(0)
  })

  it('creates one transactional order and returns the same order on an idempotent retry', async () => {
    const variant = originalVariants[0]!
    const input = checkoutInput({ promoCode: promotion.code })
    const item = {
      productId: product.id,
      quantity: 1,
      variantId: variant.id ?? null,
    }
    const beforePromotion = await payload.findByID({
      collection: 'promotions',
      id: promotion.id,
    })

    const first = await checkout(await createRequest(), [item], input)
    const retry = await checkout(await createRequest(), [item], input)
    const conflictingInput = {
      ...input,
      customer: { ...input.customer, email: `other-${uniqueKey}@example.com` },
    }

    expect(first.idempotentReplay).toBe(false)
    expect(retry.idempotentReplay).toBe(true)
    expect(retry.order.id).toBe(first.order.id)
    await expect(
      checkout(await createRequest(), [item], conflictingInput),
    ).rejects.toMatchObject({ code: 'idempotencyConflict', status: 409 })

    const orders = await payload.count({
      collection: 'orders',
      where: { idempotencyKey: { equals: input.idempotencyKey } },
    })
    const updatedProduct = await payload.findByID({
      collection: 'products',
      id: product.id,
      depth: 0,
    })
    const updatedPromotion = await payload.findByID({
      collection: 'promotions',
      id: promotion.id,
    })

    expect(orders.totalDocs).toBe(1)
    expect(updatedProduct.variants?.find(({ id }) => id === variant.id)?.stock).toBe(
      variant.stock - 1,
    )
    expect(updatedPromotion.usedCount).toBe(beforePromotion.usedCount + 1)
  })
})
