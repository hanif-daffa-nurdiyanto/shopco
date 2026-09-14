import type { CollectionConfig, CollectionSlug } from 'payload'

import {
  adminOnlyField,
  editorOrAdmin,
  publishedOrEditorWith,
} from '@/access'
import {
  createColorField,
  createMoneyFields,
  createSeoField,
  createSlugField,
  validateMoney,
  validateStock,
  validateVariantSkus,
} from '@/fields'
import { createCollectionRevalidationHooks } from '@/hooks/revalidate-storefront'
import { getPreviewURL } from '@/libs/live-preview'
import { getStockStatus, normalizeSku } from '@/libs/product-inventory'
import type { ProductInventory } from '@/types/catalog'

const Products: CollectionConfig = {
  slug: 'products',
  access: {
    create: editorOrAdmin,
    delete: editorOrAdmin,
    read: publishedOrEditorWith({ visibility: { equals: 'catalog' } }),
    update: editorOrAdmin,
  },
  admin: {
    defaultColumns: [
      'name',
      'category',
      'brand',
      'price',
      'stockStatus',
      '_status',
      'updatedAt',
    ],
    group: 'Content',
    listSearchableFields: ['name', 'sku', 'slug'],
    livePreview: {
      url: ({ data, req }) => getPreviewURL('products', data.slug as string, req),
    },
    preview: (data, { req }) => getPreviewURL('products', data.slug as string, req),
    useAsTitle: 'name',
  },
  defaultSort: '-updatedAt',
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'name',
              type: 'text',
              index: true,
              required: true,
            },
            {
              name: 'shortDescription',
              type: 'textarea',
              maxLength: 240,
              required: true,
            },
            {
              name: 'description',
              type: 'richText',
            },
            {
              name: 'details',
              type: 'array',
              admin: {
                initCollapsed: true,
              },
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'value',
                  type: 'textarea',
                  required: true,
                },
              ],
              maxRows: 12,
            },
          ],
        },
        {
          label: 'Media',
          fields: [
            {
              name: 'featuredImage',
              type: 'upload',
              filterOptions: { mimeType: { contains: 'image' } },
              relationTo: 'media',
              required: true,
            },
            {
              name: 'gallery',
              type: 'array',
              admin: {
                initCollapsed: true,
              },
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  filterOptions: { mimeType: { contains: 'image' } },
                  relationTo: 'media',
                  required: true,
                },
                {
                  name: 'altOverride',
                  type: 'text',
                },
              ],
              minRows: 1,
              required: true,
            },
          ],
        },
        {
          label: 'Pricing & Inventory',
          fields: [
            {
              name: 'sku',
              type: 'text',
              hooks: {
                beforeValidate: [({ value }) => normalizeSku(value)],
              },
              index: true,
              required: true,
              unique: true,
            },
            createMoneyFields(),
            {
              name: 'costPrice',
              type: 'number',
              access: {
                create: adminOnlyField,
                read: adminOnlyField,
                update: adminOnlyField,
              },
              admin: {
                description: 'Hanya dapat dilihat dan diubah oleh admin.',
                step: 0.01,
              },
              min: 0,
              validate: validateMoney,
            },
            {
              name: 'trackInventory',
              type: 'checkbox',
              defaultValue: true,
            },
            {
              name: 'stock',
              type: 'number',
              admin: {
                condition: (data) => data.trackInventory === true && !data.variants?.length,
                step: 1,
              },
              defaultValue: 0,
              min: 0,
              validate: validateStock,
            },
            {
              name: 'variants',
              type: 'array',
              admin: {
                description: 'Gunakan variant bila stok dibedakan berdasarkan ukuran atau warna.',
                initCollapsed: true,
              },
              fields: [
                createColorField(),
                {
                  name: 'size',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'sku',
                  type: 'text',
                  hooks: {
                    beforeValidate: [({ value }) => normalizeSku(value)],
                  },
                  required: true,
                },
                {
                  name: 'priceOverride',
                  type: 'number',
                  admin: {
                    step: 0.01,
                  },
                  min: 0,
                  validate: validateMoney,
                },
                {
                  name: 'stock',
                  type: 'number',
                  defaultValue: 0,
                  min: 0,
                  required: true,
                  validate: validateStock,
                },
                {
                  name: 'isActive',
                  type: 'checkbox',
                  defaultValue: true,
                },
              ],
              maxRows: 100,
              validate: (value) =>
                validateVariantSkus(value as Array<{ sku?: null | string }> | null | undefined),
            },
            {
              name: 'stockStatus',
              type: 'select',
              admin: {
                readOnly: true,
              },
              hooks: {
                afterRead: [({ siblingData }) => getStockStatus(siblingData as ProductInventory)],
              },
              options: [
                { label: 'In stock', value: 'inStock' },
                { label: 'Low stock', value: 'lowStock' },
                { label: 'Out of stock', value: 'outOfStock' },
              ],
              virtual: true,
            },
          ],
        },
        {
          label: 'Merchandising',
          fields: [
            {
              name: 'badge',
              type: 'select',
              defaultValue: 'none',
              options: [
                { label: 'None', value: 'none' },
                { label: 'New', value: 'new' },
                { label: 'Sale', value: 'sale' },
                { label: 'Best seller', value: 'bestSeller' },
              ],
              required: true,
            },
            {
              name: 'relatedProducts',
              type: 'relationship',
              filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
              hasMany: true,
              maxDepth: 1,
              relationTo: 'products' as CollectionSlug,
            },
            {
              name: 'featuredSections',
              type: 'select',
              hasMany: true,
              options: [
                { label: 'New Arrivals', value: 'newArrivals' },
                { label: 'Top Selling', value: 'topSelling' },
              ],
            },
          ],
        },
        {
          label: 'SEO',
          fields: [createSeoField()],
        },
      ],
    },
    createSlugField({ useAsSlug: 'name' }),
    {
      name: 'category',
      type: 'relationship',
      admin: {
        position: 'sidebar',
      },
      index: true,
      maxDepth: 1,
      relationTo: 'categories' as CollectionSlug,
      required: true,
    },
    {
      name: 'brand',
      type: 'relationship',
      admin: {
        position: 'sidebar',
      },
      maxDepth: 1,
      relationTo: 'brands' as CollectionSlug,
    },
    {
      name: 'visibility',
      type: 'select',
      admin: {
        description: 'Hanya Catalog yang dapat dibaca publik.',
        position: 'sidebar',
      },
      defaultValue: 'catalog',
      options: [
        { label: 'Catalog', value: 'catalog' },
        { label: 'Hidden', value: 'hidden' },
        { label: 'Archived', value: 'archived' },
      ],
      required: true,
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      admin: {
        position: 'sidebar',
      },
      defaultValue: false,
    },
    {
      name: 'sortPriority',
      type: 'number',
      admin: {
        position: 'sidebar',
        step: 1,
      },
      defaultValue: 0,
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) =>
            siblingData._status === 'published' && !value ? new Date().toISOString() : value,
        ],
      },
    },
  ],
  labels: {
    plural: 'Products',
    singular: 'Product',
  },
  hooks: createCollectionRevalidationHooks('products'),
  versions: {
    drafts: true,
    maxPerDoc: 50,
  },
}

export { Products }
