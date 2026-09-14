// @vitest-environment node

import { getPayload, type Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

import {
  fallbackFooter,
  fallbackHeader,
  fallbackHomepage,
  fallbackStoreSettings,
  getFallbackProductDetail,
} from '@/libs/storefront-fallbacks'
import {
  parseCategoryFilters,
  queryCategoryPage,
  queryFooter,
  queryHeader,
  queryHomepage,
  queryProductDetail,
  queryStoreSettings,
} from '@/libs/storefront-data'
import { seedShopco } from '@/seed/seed-shopco'
import config from '@/payload.config'

describe.sequential('typed storefront data access', () => {
  let payload: Payload

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    await seedShopco(payload)
  }, 60_000)

  it('matches seeded Global content with the local safety fallback', async () => {
    const [settings, header, footer, homepage] = await Promise.all([
      queryStoreSettings(),
      queryHeader(),
      queryFooter(),
      queryHomepage(),
    ])

    expect(settings.storeName).toBe(fallbackStoreSettings.storeName)
    expect(header.navigationItems.map(({ label }) => label)).toEqual(
      fallbackHeader.navigationItems.map(({ label }) => label),
    )
    expect(footer.linkGroups.map(({ heading }) => heading)).toEqual(
      fallbackFooter.linkGroups.map(({ heading }) => heading),
    )
    expect(homepage.newArrivals.map(({ name }) => name)).toEqual(
      fallbackHomepage.newArrivals.map(({ name }) => name),
    )
  })

  it('applies category sorting, filters, and pagination explicitly', async () => {
    const filters = parseCategoryFilters({
      maxPrice: '150',
      page: '1',
      sort: 'priceAscending',
    })
    const category = await queryCategoryPage('casual', filters)

    expect(category).not.toBeNull()
    expect(category?.filters).toMatchObject({ maxPrice: 150, page: 1, sort: 'priceAscending' })
    expect(category?.products.every(({ price }) => price <= 150)).toBe(true)
    expect(category?.products.map(({ price }) => price)).toEqual(
      [...(category?.products ?? [])].map(({ price }) => price).sort((left, right) => left - right),
    )
  })

  it('returns the product, populated variants, related products, and approved reviews', async () => {
    const content = await queryProductDetail('one-life-graphic-t-shirt')
    const fallback = getFallbackProductDetail('one-life-graphic-t-shirt')

    expect(content?.product.name).toBe(fallback?.product.name)
    expect(content?.product.colors.length).toBeGreaterThan(0)
    expect(content?.product.details).toEqual(
      expect.arrayContaining([
        { label: 'Material', value: 'Soft, breathable premium cotton blend.' },
        { label: 'Care', value: 'Machine wash cold with similar colors.' },
      ]),
    )
    expect(content?.product.sizes.length).toBeGreaterThan(0)
    expect(content?.relatedProducts).toHaveLength(4)
    expect(content?.reviews).toHaveLength(6)
    expect(content?.totalReviews).toBe(6)
  })

  it('returns null for unavailable category and product slugs', async () => {
    const filters = parseCategoryFilters({})

    await expect(queryCategoryPage('missing-category', filters)).resolves.toBeNull()
    await expect(queryProductDetail('missing-product')).resolves.toBeNull()
  })
})
