// @vitest-environment node

import { createLocalReq, getPayload, type Payload, type PayloadRequest } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { Categories } from '@/collections/categories-collection'
import { Products } from '@/collections/products-collection'
import { Footer } from '@/globals/footer'
import { Header } from '@/globals/header'
import { Homepage } from '@/globals/homepage'
import { createCollectionRevalidationHooks } from '@/hooks/revalidate-storefront'
import { getPreviewPath, getPreviewURL } from '@/libs/live-preview'
import {
  buildProductStructuredData,
  buildStorefrontMetadata,
} from '@/libs/seo'
import {
  queryProductDetail,
  queryStoreSettings,
} from '@/libs/storefront-data'
import type { Product, User } from '@/payload-types'
import config from '@/payload.config'
import { seedShopco } from '@/seed/seed-shopco'

describe.sequential('editorial workflow, preview, revalidation, and SEO', () => {
  let editor: User
  let payload: Payload
  let product: Product

  const uniqueKey = `${Date.now()}-${Math.random().toString(36).slice(2)}`

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    await seedShopco(payload)
    editor = await payload.create({
      collection: 'users',
      data: {
        email: `preview-editor-${uniqueKey}@example.com`,
        name: 'Preview Integration Editor',
        password: 'integration-password',
        roles: ['editor'],
        status: 'active',
      },
    })
    const products = await payload.find({
      collection: 'products',
      depth: 0,
      limit: 1,
      pagination: false,
      where: { slug: { equals: 'one-life-graphic-t-shirt' } },
    })
    product = products.docs[0] as Product
  }, 60_000)

  afterAll(async () => {
    if (!payload || !editor) return
    await payload.delete({ collection: 'users', id: editor.id })
  })

  it('configures authenticated live preview URLs for the requested entities', async () => {
    const req = await createLocalReq({}, payload)

    expect(Products.admin?.livePreview).toBeTruthy()
    expect(Categories.admin?.livePreview).toBeTruthy()
    expect(Homepage.admin?.livePreview).toBeTruthy()
    expect(Header.admin?.livePreview).toBeTruthy()
    expect(Footer.admin?.livePreview).toBeTruthy()
    expect(getPreviewPath('products', product.slug)).toBe(`/product/${product.slug}`)
    expect(getPreviewURL('products', product.slug, req)).toContain(
      `entity=products&slug=${product.slug}`,
    )
  })

  it('keeps drafts private and applies publish and unpublish without an application restart', async () => {
    const originalName = product.name
    const draftName = `Preview Draft ${uniqueKey}`
    const publishedPaths: string[] = []
    const unpublishedPaths: string[] = []

    try {
      await payload.update({
        collection: 'products',
        context: { revalidatedPaths: [] },
        data: { name: draftName },
        draft: true,
        id: product.id,
        overrideAccess: false,
        user: editor,
      })

      const editorPreview = await queryProductDetail(product.slug, { draft: true, user: editor })
      const anonymousPreviewAttempt = await queryProductDetail(product.slug, { draft: true })
      const publishedBefore = await queryProductDetail(product.slug)

      expect(editorPreview?.product.name).toBe(draftName)
      expect(anonymousPreviewAttempt).toBeNull()
      expect(publishedBefore?.product.name).toBe(originalName)

      await payload.update({
        collection: 'products',
        context: { revalidatedPaths: publishedPaths },
        data: { _status: 'published', name: draftName },
        draft: false,
        id: product.id,
        overrideAccess: false,
        user: editor,
      })
      expect((await queryProductDetail(product.slug))?.product.name).toBe(draftName)
      expect(publishedPaths).toEqual(
        expect.arrayContaining(['/', `/product/${product.slug}`, '/category/casual']),
      )

      await payload.update({
        collection: 'products',
        context: { revalidatedPaths: unpublishedPaths },
        data: { _status: 'draft' },
        draft: false,
        id: product.id,
        overrideAccess: false,
        user: editor,
      })
      expect(await queryProductDetail(product.slug)).toBeNull()
      expect(unpublishedPaths).toContain(`/product/${product.slug}`)
    } finally {
      await payload.update({
        collection: 'products',
        context: { skipRevalidation: true },
        data: { _status: 'published', name: originalName },
        draft: false,
        id: product.id,
        overrideAccess: false,
        user: editor,
      })
    }
  })

  it('honors the revalidation context guard', async () => {
    const paths: string[] = []
    const req = await createLocalReq(
      { context: { revalidatedPaths: paths, skipRevalidation: true } },
      payload,
    )
    const hook = createCollectionRevalidationHooks('products').afterChange[0]!

    await hook({
      collection: payload.collections.products.config,
      context: req.context,
      data: product,
      doc: product,
      operation: 'update',
      overrideAccess: true,
      previousDoc: product,
      req: req as PayloadRequest,
    })
    expect(paths).toEqual([])
  })

  it('builds canonical, Open Graph, and validated Product structured data', async () => {
    const [content, settings] = await Promise.all([
      queryProductDetail(product.slug),
      queryStoreSettings(),
    ])
    expect(content).not.toBeNull()
    if (!content) return

    const metadata = buildStorefrontMetadata(
      content.seo,
      settings,
      `/product/${product.slug}`,
    )
    const structuredData = buildProductStructuredData(
      content.product,
      content.seo,
      settings,
      content.totalReviews,
    )

    expect(metadata.alternates?.canonical).toContain(`/product/${product.slug}`)
    expect(metadata.openGraph?.images).toBeTruthy()
    expect(structuredData).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      offers: {
        '@type': 'Offer',
        priceCurrency: settings.currency,
      },
      sku: product.sku,
    })
    expect(
      buildProductStructuredData(
        { ...content.product, price: Number.NaN },
        content.seo,
        settings,
        content.totalReviews,
      ),
    ).toBeNull()
  })
})
