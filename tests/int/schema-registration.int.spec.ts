import type { CollectionConfig, GlobalConfig } from 'payload'
import { describe, expect, it } from 'vitest'

import { Brands } from '@/collections/brands-collection'
import { Categories } from '@/collections/categories-collection'
import { Media } from '@/collections/media-collection'
import { Orders } from '@/collections/orders-collection'
import { Products } from '@/collections/products-collection'
import { Promotions } from '@/collections/promotions-collection'
import { Reviews } from '@/collections/reviews-collection'
import { Users } from '@/collections/users-collection'
import { Footer } from '@/globals/footer'
import { Header } from '@/globals/header'
import { Homepage } from '@/globals/homepage'
import { StoreSettings } from '@/globals/store-settings'
import config from '@/payload.config'

const collections = [Users, Media, Brands, Categories, Products, Reviews, Promotions, Orders]
const globals = [StoreSettings, Header, Footer, Homepage]

const expectedCollectionAdmin: Record<
  string,
  {
    defaultColumns: string[]
    defaultSort: string
    group: string
    searchableFields: string[]
  }
> = {
  users: {
    defaultColumns: ['name', 'email', 'roles', 'status', 'updatedAt'],
    defaultSort: '-updatedAt',
    group: 'System',
    searchableFields: ['name', 'email'],
  },
  media: {
    defaultColumns: ['filename', 'alt', 'updatedAt'],
    defaultSort: '-updatedAt',
    group: 'System',
    searchableFields: ['filename', 'alt', 'caption'],
  },
  brands: {
    defaultColumns: ['name', 'isFeatured', 'sortOrder', 'isActive', '_status', 'updatedAt'],
    defaultSort: 'sortOrder',
    group: 'Content',
    searchableFields: ['name', 'slug'],
  },
  categories: {
    defaultColumns: ['name', 'parent', 'sortOrder', 'isVisible', '_status', 'updatedAt'],
    defaultSort: 'sortOrder',
    group: 'Content',
    searchableFields: ['name', 'slug'],
  },
  products: {
    defaultColumns: ['name', 'category', 'brand', 'price', 'stockStatus', '_status', 'updatedAt'],
    defaultSort: '-updatedAt',
    group: 'Content',
    searchableFields: ['name', 'sku', 'slug'],
  },
  reviews: {
    defaultColumns: ['authorName', 'product', 'rating', 'status', 'featured', 'createdAt'],
    defaultSort: '-createdAt',
    group: 'Content',
    searchableFields: ['authorName', 'authorEmail', 'content'],
  },
  promotions: {
    defaultColumns: ['code', 'type', 'value', 'status', 'startsAt', 'endsAt', 'usedCount'],
    defaultSort: '-createdAt',
    group: 'Commerce',
    searchableFields: ['code'],
  },
  orders: {
    defaultColumns: [
      'orderNumber',
      'customerEmail',
      'total',
      'paymentStatus',
      'fulfillmentStatus',
      'createdAt',
    ],
    defaultSort: '-createdAt',
    group: 'Commerce',
    searchableFields: ['orderNumber', 'customerEmail', 'customerName'],
  },
}

const expectCollectionMetadata = (collection: CollectionConfig) => {
  const expected = expectedCollectionAdmin[collection.slug]

  expect(expected).toBeDefined()
  expect(collection.admin?.group).toBe(expected.group)
  expect(collection.admin?.defaultColumns).toEqual(expected.defaultColumns)
  expect(collection.admin?.listSearchableFields).toEqual(expected.searchableFields)
  expect(collection.defaultSort).toBe(expected.defaultSort)
  expect(collection.labels).toMatchObject({
    plural: expect.any(String),
    singular: expect.any(String),
  })
}

const expectGlobalMetadata = (global: GlobalConfig) => {
  expect(global.label).toEqual(expect.any(String))
  expect(global.admin?.group).toEqual(expect.any(String))
}

describe('Payload schema registration metadata', () => {
  it('keeps Collections in their dependency-aware registration order', async () => {
    const payloadConfig = await config

    expect(payloadConfig.collections?.slice(0, collections.length).map(({ slug }) => slug)).toEqual([
      'users',
      'media',
      'brands',
      'categories',
      'products',
      'reviews',
      'promotions',
      'orders',
    ])
  })

  it('keeps Globals in their storefront composition order', async () => {
    const payloadConfig = await config

    expect(payloadConfig.globals?.map(({ slug }) => slug)).toEqual([
      'store-settings',
      'header',
      'footer',
      'homepage',
    ])
  })

  it.each(collections)('$slug has consistent Admin list metadata', expectCollectionMetadata)
  it.each(globals)('$slug has explicit Admin navigation metadata', expectGlobalMetadata)
})
