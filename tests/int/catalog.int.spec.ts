// @vitest-environment node

import config from '@/payload.config'
import type { Brand, Category, Media, Product, Review, User } from '@/payload-types'
import { getPayload, type Payload, type RequiredDataFromCollectionSlug } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const pixelPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
)

const createImageFile = (name: string) => ({
  data: pixelPng,
  mimetype: 'image/png',
  name,
  size: pixelPng.length,
})

describe.sequential('catalog collections', () => {
  let approvedReview: Review
  let brand: Brand
  let category: Category
  let draftBrand: Brand
  let media: Media
  let payload: Payload
  let pendingReview: Review
  let product: Product

  const uniqueKey = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const editor = {
    id: 999_999,
    collection: 'users',
    roles: ['editor'],
    status: 'active',
  } as unknown as User

  const productData = (
    name: string,
    slug: string,
    sku: string,
  ): RequiredDataFromCollectionSlug<'products'> => ({
    name,
    shortDescription: 'Integration test product description.',
    featuredImage: media.id,
    gallery: [{ image: media.id }],
    sku,
    price: 100_000,
    compareAtPrice: 150_000,
    trackInventory: true,
    variants: [
      {
        color: { name: 'Black', hex: '#000000' },
        size: 'M',
        sku: `${sku}-black-m`,
        stock: 3,
        isActive: true,
      },
    ],
    badge: 'new',
    slug,
    category: category.id,
    brand: brand.id,
    visibility: 'catalog',
  })

  beforeAll(async () => {
    payload = await getPayload({ config: await config })

    media = await payload.create({
      collection: 'media',
      data: { alt: 'Catalog integration image' },
      file: createImageFile(`catalog-${uniqueKey}.png`),
    })

    brand = await payload.create({
      collection: 'brands',
      data: {
        name: `Brand ${uniqueKey}`,
        logo: media.id,
        slug: `brand-${uniqueKey}`,
        isActive: true,
      },
      draft: false,
    })

    category = await payload.create({
      collection: 'categories',
      data: {
        name: `Category ${uniqueKey}`,
        slug: `category-${uniqueKey}`,
        defaultSort: 'popular',
        isVisible: true,
      },
      draft: false,
    })

    product = await payload.create({
      collection: 'products',
      data: productData(
        `Product ${uniqueKey}`,
        `product-${uniqueKey}`,
        `sku-${uniqueKey}`,
      ),
      draft: false,
    })

    category = await payload.update({
      collection: 'categories',
      id: category.id,
      data: { featuredProducts: [product.id] },
      draft: false,
    })

    approvedReview = await payload.create({
      collection: 'reviews',
      data: {
        authorEmail: `approved-${uniqueKey}@example.com`,
        authorName: 'Approved Reviewer',
        content: 'This product is excellent and fits perfectly.',
        product: product.id,
        rating: 4.5,
        status: 'approved',
      },
    })

    pendingReview = await payload.create({
      collection: 'reviews',
      data: {
        authorEmail: `pending-${uniqueKey}@example.com`,
        authorName: 'Pending Reviewer',
        content: 'This review is still waiting for moderation.',
        product: product.id,
        rating: 4,
        status: 'pending',
      },
    })

    draftBrand = await payload.create({
      collection: 'brands',
      data: {
        name: `Draft Brand ${uniqueKey}`,
        logo: media.id,
        slug: `draft-brand-${uniqueKey}`,
        isActive: true,
      },
      draft: true,
    })
  })

  afterAll(async () => {
    if (!payload) return

    await payload.delete({
      collection: 'reviews',
      where: { id: { in: [approvedReview?.id, pendingReview?.id].filter(Boolean) } },
    })
    await payload.delete({
      collection: 'products',
      where: { slug: { contains: uniqueKey } },
    })
    await payload.delete({
      collection: 'categories',
      where: { slug: { contains: uniqueKey } },
    })
    await payload.delete({
      collection: 'brands',
      where: { slug: { contains: uniqueKey } },
    })
    if (media) await payload.delete({ collection: 'media', id: media.id })
  })

  it('creates, reads, updates, and resolves catalog relationships', async () => {
    const result = await payload.findByID({
      collection: 'products',
      depth: 1,
      id: product.id,
    })

    expect(result.stockStatus).toBe('lowStock')
    expect(result.sku).toBe(`SKU-${uniqueKey}`.toUpperCase())
    expect(typeof result.category).toBe('object')
    expect(typeof result.brand).toBe('object')

    const updated = await payload.update({
      collection: 'products',
      id: product.id,
      data: { price: 110_000, compareAtPrice: 150_000 },
    })

    expect(updated.price).toBe(110_000)

    const categoryResult = await payload.findByID({
      collection: 'categories',
      depth: 1,
      id: category.id,
    })

    expect(categoryResult.featuredProducts).toHaveLength(1)
  })

  it('enforces unique slugs and product SKUs', async () => {
    await expect(
      payload.create({
        collection: 'brands',
        data: {
          name: `Duplicate Brand ${uniqueKey}`,
          logo: media.id,
          slug: brand.slug,
          isActive: true,
        },
        draft: false,
      }),
    ).rejects.toThrow()

    await expect(
      payload.create({
        collection: 'products',
        data: productData(
          `Duplicate SKU Product ${uniqueKey}`,
          `duplicate-sku-product-${uniqueKey}`,
          product.sku.toLowerCase(),
        ),
        draft: false,
      }),
    ).rejects.toThrow()
  })

  it('rejects invalid pricing and duplicate variant SKUs', async () => {
    await expect(
      payload.create({
        collection: 'products',
        data: {
          ...productData(
            `Invalid Price Product ${uniqueKey}`,
            `invalid-price-${uniqueKey}`,
            `invalid-price-${uniqueKey}`,
          ),
          compareAtPrice: 90_000,
        },
        draft: false,
      }),
    ).rejects.toThrow()

    const duplicateVariantData = productData(
      `Duplicate Variant Product ${uniqueKey}`,
      `duplicate-variant-${uniqueKey}`,
      `duplicate-variant-${uniqueKey}`,
    )
    duplicateVariantData.variants = [
      ...(duplicateVariantData.variants ?? []),
      {
        color: { name: 'White', hex: '#FFFFFF' },
        size: 'L',
        sku: `${duplicateVariantData.sku}-BLACK-M`,
        stock: 2,
      },
    ]

    await expect(
      payload.create({
        collection: 'products',
        data: duplicateVariantData,
        draft: false,
      }),
    ).rejects.toThrow()
  })

  it('hides drafts from public access and exposes them after publishing', async () => {
    const publicDraft = await payload.find({
      collection: 'brands',
      overrideAccess: false,
      where: { id: { equals: draftBrand.id } },
    })

    expect(publicDraft.docs).toHaveLength(0)

    const editorDraft = await payload.findByID({
      collection: 'brands',
      id: draftBrand.id,
      overrideAccess: false,
      user: editor,
    })
    expect(editorDraft._status).toBe('draft')

    draftBrand = await payload.update({
      collection: 'brands',
      id: draftBrand.id,
      data: { _status: 'published' },
      draft: false,
    })

    const publicPublished = await payload.find({
      collection: 'brands',
      overrideAccess: false,
      where: { id: { equals: draftBrand.id } },
    })
    expect(publicPublished.docs).toHaveLength(1)
  })

  it('returns only approved reviews publicly and hides private moderation fields', async () => {
    const result = await payload.find({
      collection: 'reviews',
      overrideAccess: false,
      where: { product: { equals: product.id } },
    })

    expect(result.docs).toHaveLength(1)
    expect(result.docs[0]?.id).toBe(approvedReview.id)
    expect(result.docs[0]?.authorEmail).toBeUndefined()
    expect(result.docs.some(({ id }) => id === pendingReview.id)).toBe(false)
  })
})
