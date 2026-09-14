// @vitest-environment node

import config from '@/payload.config'
import type { Order, Promotion, User } from '@/payload-types'
import { getPayload, type Payload, type RequiredDataFromCollectionSlug } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

describe.sequential('commerce collections', () => {
  let adminUser: User
  let customer: User
  let otherCustomer: User
  let order: Order
  let otherOrder: Order
  let payload: Payload
  let promotion: Promotion

  const uniqueKey = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const editor = {
    id: 999_992,
    collection: 'users',
    roles: ['editor'],
    status: 'active',
  } as unknown as User

  const orderData = (
    orderCustomer: User,
    overrides: Partial<RequiredDataFromCollectionSlug<'orders'>> = {},
  ): RequiredDataFromCollectionSlug<'orders'> => ({
    items: [
      {
        productSnapshotId: 'product-shirt',
        categoryId: 'category-clothing',
        productName: 'Snapshot Shirt',
        sku: 'SHIRT-BLACK-M',
        variant: { id: 'variant-black-m', color: 'Black', size: 'M' },
        quantity: 2,
        unitPrice: 100,
        lineTotal: 9_999,
      },
      {
        productSnapshotId: 'product-belt',
        categoryId: 'category-accessories',
        productName: 'Snapshot Belt',
        sku: 'BELT-ONE-SIZE',
        quantity: 1,
        unitPrice: 50,
        lineTotal: 9_999,
      },
    ],
    customerName: orderCustomer.name,
    customerEmail: orderCustomer.email,
    shippingAddress: {
      recipientName: orderCustomer.name,
      line1: 'Jl. Integration Test No. 1',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      postalCode: '10110',
      country: 'Indonesia',
    },
    deliveryMethod: 'standard',
    paymentProvider: 'manual',
    subtotal: 0,
    discount: 0,
    deliveryFee: 15,
    taxRate: 10,
    tax: 0,
    total: 0,
    paymentStatus: 'pending',
    fulfillmentStatus: 'unfulfilled',
    customer: orderCustomer.id,
    promotion: promotion?.id,
    ...overrides,
  })

  beforeAll(async () => {
    payload = await getPayload({ config: await config })

    adminUser = await payload.create({
      collection: 'users',
      data: {
        email: `commerce-admin-${uniqueKey}@example.com`,
        name: 'Commerce Admin',
        password: 'integration-password',
        roles: ['admin'],
        status: 'active',
      },
    })

    customer = await payload.create({
      collection: 'users',
      data: {
        email: `commerce-customer-${uniqueKey}@example.com`,
        name: 'Commerce Customer',
        password: 'integration-password',
        roles: ['customer'],
        status: 'active',
      },
    })
    otherCustomer = await payload.create({
      collection: 'users',
      data: {
        email: `commerce-other-${uniqueKey}@example.com`,
        name: 'Other Commerce Customer',
        password: 'integration-password',
        roles: ['customer'],
        status: 'active',
      },
    })

    promotion = await payload.create({
      collection: 'promotions',
      data: {
        code: ` save-${uniqueKey} `,
        type: 'percentage',
        value: 10,
        minimumSubtotal: 200,
        maximumDiscount: 100,
        appliesTo: 'all',
        startsAt: '2026-01-01T00:00:00.000Z',
        endsAt: '2027-01-01T00:00:00.000Z',
        usageLimit: 100,
        usageLimitPerCustomer: 1,
        usedCount: 0,
        isActive: true,
      },
    })

    order = await payload.create({
      collection: 'orders',
      data: orderData(customer),
      overrideAccess: false,
      user: adminUser,
    })

    otherOrder = await payload.create({
      collection: 'orders',
      data: orderData(otherCustomer, {
        customerEmail: otherCustomer.email,
        customerName: otherCustomer.name,
        customer: otherCustomer.id,
        promotion: null,
      }),
      overrideAccess: false,
      user: adminUser,
    })
  })

  afterAll(async () => {
    if (!payload) return

    await payload.delete({
      collection: 'orders',
      where: { customerEmail: { contains: uniqueKey } },
    })
    if (promotion) await payload.delete({ collection: 'promotions', id: promotion.id })
    await payload.delete({
      collection: 'users',
      where: { email: { contains: uniqueKey } },
    })
  })

  it('normalizes promotion rules and calculates order totals on the server', () => {
    expect(promotion.code).toBe(`SAVE-${uniqueKey}`.toUpperCase())
    expect(promotion.status).toBe('active')

    expect(order.items.map(({ lineTotal }) => lineTotal)).toEqual([200, 50])
    expect(order.subtotal).toBe(250)
    expect(order.discount).toBe(25)
    expect(order.deliveryFee).toBe(15)
    expect(order.tax).toBe(22.5)
    expect(order.total).toBe(262.5)
    expect(order.orderNumber).toMatch(/^ORD-\d{8}-[A-Z0-9-]+$/)
  })

  it('keeps item snapshots and calculated totals immutable', async () => {
    await expect(
      payload.update({
        collection: 'orders',
        id: order.id,
        data: {
          items: [{ ...order.items[0]!, productName: 'Tampered Product Name' }],
        },
      }),
    ).rejects.toThrow('Order item snapshots and totals cannot be modified.')

    const updated = await payload.update({
      collection: 'orders',
      id: order.id,
      data: { paymentStatus: 'paid' },
    })

    expect(updated.paymentStatus).toBe('paid')
    expect(updated.items[0]?.productName).toBe('Snapshot Shirt')
    expect(updated.total).toBe(262.5)
  })

  it('restricts customers to reading only their own orders', async () => {
    const result = await payload.find({
      collection: 'orders',
      overrideAccess: false,
      user: customer,
    })

    expect(result.docs).toHaveLength(1)
    expect(result.docs[0]?.id).toBe(order.id)
    expect(result.docs.some(({ id }) => id === otherOrder.id)).toBe(false)

    await expect(
      payload.find({
        collection: 'promotions',
        overrideAccess: false,
        user: customer,
      }),
    ).rejects.toThrow()

    await expect(
      payload.find({
        collection: 'orders',
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })

  it('rejects public and non-admin writes to Orders and Promotions', async () => {
    await expect(
      payload.create({
        collection: 'orders',
        data: orderData(customer),
        overrideAccess: false,
      }),
    ).rejects.toThrow()

    await expect(
      payload.create({
        collection: 'promotions',
        data: {
          code: `PUBLIC-${uniqueKey}`,
          type: 'fixed',
          value: 10,
          appliesTo: 'all',
          usedCount: 0,
        },
        overrideAccess: false,
        user: customer,
      }),
    ).rejects.toThrow()

    await expect(
      payload.update({
        collection: 'promotions',
        id: promotion.id,
        data: { value: 50 },
        overrideAccess: false,
      }),
    ).rejects.toThrow()

    await expect(
      payload.update({
        collection: 'promotions',
        id: promotion.id,
        data: { value: 50 },
        overrideAccess: false,
        user: editor,
      }),
    ).rejects.toThrow()
  })

  it('validates promotion percentage and validity windows', async () => {
    await expect(
      payload.create({
        collection: 'promotions',
        data: {
          code: `INVALID-PERCENT-${uniqueKey}`,
          type: 'percentage',
          value: 101,
          appliesTo: 'all',
          usedCount: 0,
        },
      }),
    ).rejects.toThrow()

    await expect(
      payload.create({
        collection: 'promotions',
        data: {
          code: `INVALID-DATE-${uniqueKey}`,
          type: 'fixed',
          value: 10,
          appliesTo: 'all',
          startsAt: '2026-12-31T00:00:00.000Z',
          endsAt: '2026-01-01T00:00:00.000Z',
          usedCount: 0,
        },
      }),
    ).rejects.toThrow()
  })
})
