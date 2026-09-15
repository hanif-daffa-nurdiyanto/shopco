import type { AccessArgs, CollectionConfig, FieldAccessArgs } from 'payload'
import { describe, expect, it } from 'vitest'

import {
  adminOnly,
  adminOnlyField,
  adminOrSelf,
  customerOnly,
  editorOrAdmin,
  publishedOrEditor,
} from '@/access'
import { rolePermissionMatrix } from '@/constants/roles'
import {
  validateCompareAtPrice,
  validateHexColor,
  validateMoney,
  validateRating,
  validateStock,
  validateVariantSkus,
} from '@/fields'
import { getStockStatus, normalizeSku } from '@/libs/product-inventory'
import { AuthValidationError, parseSignUpInput } from '@/libs/auth-validation'
import { Brands } from '@/collections/brands-collection'
import { Categories } from '@/collections/categories-collection'
import { Products } from '@/collections/products-collection'
import { Promotions } from '@/collections/promotions-collection'
import { Reviews } from '@/collections/reviews-collection'
import { Orders } from '@/collections/orders-collection'
import {
  calculateDeliveryFee,
  calculateDiscount,
  calculateOrderTotals,
  calculateSubtotal,
  calculateTax,
  getPromotionEligibility,
  getPromotionStatus,
} from '@/libs/commerce-calculations'

const accessArgs = (user: null | Record<string, unknown>) =>
  ({ req: { user } }) as unknown as AccessArgs

const fieldAccessArgs = (user: null | Record<string, unknown>) =>
  ({ req: { user } }) as unknown as FieldAccessArgs

describe('role access helpers', () => {
  it('grants full access only to admins', async () => {
    expect(await adminOnly(accessArgs({ id: 1, roles: ['admin'] }))).toBe(true)
    expect(await adminOnly(accessArgs({ id: 2, roles: ['editor'] }))).toBe(false)
    expect(await adminOnlyField(fieldAccessArgs({ id: 1, roles: ['admin'] }))).toBe(true)
  })

  it('allows editors to manage content without user management permission', async () => {
    const editor = { id: 2, roles: ['editor'] }

    expect(await editorOrAdmin(accessArgs(editor))).toBe(true)
    expect(rolePermissionMatrix.editor.manageContent).toBe(true)
    expect(rolePermissionMatrix.editor.manageUsers).toBe(false)
  })

  it('recognizes customers and restricts them to their own user document', async () => {
    const customer = { id: 42, roles: ['customer'] }

    expect(await customerOnly(accessArgs(customer))).toBe(true)
    expect(await adminOrSelf(accessArgs(customer))).toEqual({ id: { equals: 42 } })
  })

  it('limits anonymous content reads to published documents', async () => {
    expect(await publishedOrEditor(accessArgs(null))).toEqual({
      _status: { equals: 'published' },
    })
    expect(await publishedOrEditor(accessArgs({ id: 2, roles: ['editor'] }))).toBe(true)
  })
})

describe('shared field validation', () => {
  it('accepts non-negative money values', () => {
    expect(validateMoney(0)).toBe(true)
    expect(validateMoney(125_000)).toBe(true)
    expect(validateMoney(-1)).toEqual(expect.any(String))
  })

  it('requires compare-at price to exceed the selling price', () => {
    expect(validateCompareAtPrice(150_000, 100_000)).toBe(true)
    expect(validateCompareAtPrice(90_000, 100_000)).toEqual(expect.any(String))
  })

  it('validates storefront HEX colors', () => {
    expect(validateHexColor('#000')).toBe(true)
    expect(validateHexColor('#AABBCC')).toBe(true)
    expect(validateHexColor('black')).toEqual(expect.any(String))
  })

  it('validates stock, ratings, and unique variant SKUs', () => {
    expect(validateStock(0)).toBe(true)
    expect(validateStock(1.5)).toEqual(expect.any(String))
    expect(validateRating(4.5)).toBe(true)
    expect(validateRating(5.5)).toEqual(expect.any(String))
    expect(validateVariantSkus([{ sku: 'shirt-s' }, { sku: 'SHIRT-S' }])).toEqual(
      expect.any(String),
    )
  })
})

describe('product inventory helpers', () => {
  it('normalizes SKU values and computes variant stock status', () => {
    expect(normalizeSku('  shirt-black-m ')).toBe('SHIRT-BLACK-M')
    expect(
      getStockStatus({
        trackInventory: true,
        variants: [
          { isActive: true, stock: 2 },
          { isActive: false, stock: 20 },
        ],
      }),
    ).toBe('lowStock')
    expect(getStockStatus({ trackInventory: true, stock: 0 })).toBe('outOfStock')
    expect(getStockStatus({ trackInventory: false, stock: 0 })).toBe('inStock')
  })
})

describe('storefront authentication validation', () => {
  it('normalizes valid customer signup data', () => {
    expect(
      parseSignUpInput({
        email: '  CUSTOMER@Example.com ',
        name: ' Customer Name ',
        password: 'shopco123',
        passwordConfirmation: 'shopco123',
      }),
    ).toEqual({
      email: 'customer@example.com',
      name: 'Customer Name',
      password: 'shopco123',
      passwordConfirmation: 'shopco123',
    })
  })

  it('rejects weak and mismatched passwords', () => {
    expect(() =>
      parseSignUpInput({
        email: 'customer@example.com',
        name: 'Customer Name',
        password: 'password',
        passwordConfirmation: 'password',
      }),
    ).toThrow(AuthValidationError)

    expect(() =>
      parseSignUpInput({
        email: 'customer@example.com',
        name: 'Customer Name',
        password: 'password1',
        passwordConfirmation: 'different1',
      }),
    ).toThrow('Passwords do not match.')
  })
})

describe('commerce calculation helpers', () => {
  const items = [
    { productId: 'shirt', quantity: 2, unitPrice: 50 },
    { categoryId: 'accessories', productId: 'belt', quantity: 1, unitPrice: 100 },
  ]

  it('calculates subtotal, delivery fee, and tax without side effects', () => {
    expect(calculateSubtotal(items)).toBe(200)
    expect(calculateDeliveryFee(200, { baseFee: 15, freeDeliveryThreshold: 250 })).toBe(15)
    expect(calculateDeliveryFee(250, { baseFee: 15, freeDeliveryThreshold: 250 })).toBe(0)
    expect(calculateTax(185, 10)).toBe(18.5)
  })

  it('applies scoped discounts, caps them, and evaluates validity rules', () => {
    const promotion = {
      appliesTo: 'categories' as const,
      categoryIds: ['accessories'],
      isActive: true,
      maximumDiscount: 15,
      minimumSubtotal: 150,
      type: 'percentage' as const,
      value: 20,
    }

    expect(calculateDiscount(items, promotion)).toBe(15)
    expect(getPromotionEligibility({ ...promotion, minimumSubtotal: 250 }, items)).toEqual({
      eligible: false,
      reason: 'minimumSubtotal',
    })
    expect(
      getPromotionEligibility(
        { ...promotion, endsAt: '2025-01-01T00:00:00.000Z' },
        items,
        new Date('2025-01-02T00:00:00.000Z'),
      ),
    ).toEqual({ eligible: false, reason: 'expired' })
  })

  it('returns a complete order total breakdown', () => {
    expect(
      calculateOrderTotals({
        delivery: { baseFee: 15 },
        items,
        promotion: {
          appliesTo: 'all',
          isActive: true,
          type: 'percentage',
          value: 10,
        },
        taxRate: 10,
      }),
    ).toEqual({
      deliveryFee: 15,
      discount: 20,
      subtotal: 200,
      tax: 18,
      total: 213,
    })
  })

  it('computes promotion lifecycle status', () => {
    const now = new Date('2026-01-10T00:00:00.000Z')

    expect(getPromotionStatus({ isActive: false }, now)).toBe('inactive')
    expect(getPromotionStatus({ isActive: true, usageLimit: 2, usedCount: 2 }, now)).toBe(
      'exhausted',
    )
    expect(
      getPromotionStatus({ isActive: true, startsAt: '2026-02-01T00:00:00.000Z' }, now),
    ).toBe('scheduled')
  })
})

const getTabLabels = (collection: CollectionConfig) => {
  const tabsField = collection.fields.find((field) => field.type === 'tabs')

  return tabsField?.type === 'tabs' ? tabsField.tabs.map(({ label }) => label) : []
}

const getSidebarFieldNames = (collection: CollectionConfig) =>
  collection.fields.flatMap((field) => {
    if (field.type === 'row' && field.admin?.position === 'sidebar') {
      return field.fields.flatMap((nestedField) =>
        'name' in nestedField ? [nestedField.name] : [],
      )
    }

    return 'name' in field && field.admin?.position === 'sidebar' ? [field.name] : []
  })

describe('catalog admin schema', () => {
  it('keeps content forms in functional tabs', () => {
    expect(getTabLabels(Brands)).toEqual(['Content', 'Media'])
    expect(getTabLabels(Categories)).toEqual(['Overview', 'Catalog Presentation', 'SEO'])
    expect(getTabLabels(Products)).toEqual([
      'Content',
      'Media',
      'Pricing & Inventory',
      'Merchandising',
      'SEO',
    ])
    expect(getTabLabels(Reviews)).toEqual(['Review', 'Moderation'])
    expect(getTabLabels(Promotions)).toEqual(['Rules', 'Validity & Usage'])
    expect(getTabLabels(Orders)).toEqual([
      'Items',
      'Customer & Shipping',
      'Payment',
      'Timeline',
    ])
  })

  it('keeps publication and relationship controls in the sidebar', () => {
    expect(getSidebarFieldNames(Brands)).toEqual(
      expect.arrayContaining(['slug', 'isFeatured', 'sortOrder', 'isActive']),
    )
    expect(getSidebarFieldNames(Categories)).toEqual(
      expect.arrayContaining(['slug', 'parent', 'isVisible', 'sortOrder']),
    )
    expect(getSidebarFieldNames(Products)).toEqual(
      expect.arrayContaining([
        'slug',
        'category',
        'brand',
        'visibility',
        'isFeatured',
        'sortPriority',
        'publishedAt',
      ]),
    )
    expect(getSidebarFieldNames(Reviews)).toEqual(
      expect.arrayContaining(['product', 'status', 'featured']),
    )
    expect(getSidebarFieldNames(Promotions)).toEqual(
      expect.arrayContaining(['isActive', 'priority', 'status']),
    )
    expect(getSidebarFieldNames(Orders)).toEqual(
      expect.arrayContaining([
        'orderNumber',
        'paymentStatus',
        'fulfillmentStatus',
        'customer',
        'promotion',
      ]),
    )
  })

  it('enables drafts only for editorial catalog collections', () => {
    expect(Brands.versions).toMatchObject({ drafts: true })
    expect(Categories.versions).toMatchObject({ drafts: true })
    expect(Products.versions).toMatchObject({ drafts: true })
    expect(Reviews.versions).toBeUndefined()
  })
})
