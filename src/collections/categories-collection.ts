import type { CollectionConfig, CollectionSlug } from 'payload'

import { editorOrAdmin, publishedOrEditorWith } from '@/access'
import { createSeoField, createSlugField } from '@/fields'
import { createCollectionRevalidationHooks } from '@/hooks/revalidate-storefront'
import { getPreviewURL } from '@/libs/live-preview'

const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: editorOrAdmin,
    delete: editorOrAdmin,
    read: publishedOrEditorWith({ isVisible: { equals: true } }),
    update: editorOrAdmin,
  },
  admin: {
    defaultColumns: ['name', 'parent', 'sortOrder', 'isVisible', '_status', 'updatedAt'],
    group: 'Content',
    listSearchableFields: ['name', 'slug'],
    livePreview: {
      url: ({ data, req }) => getPreviewURL('categories', data.slug as string, req),
    },
    preview: (data, { req }) => getPreviewURL('categories', data.slug as string, req),
    useAsTitle: 'name',
  },
  defaultSort: 'sortOrder',
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Overview',
          fields: [
            {
              name: 'name',
              type: 'text',
              index: true,
              required: true,
            },
            {
              name: 'description',
              type: 'textarea',
            },
            {
              name: 'heroImage',
              type: 'upload',
              filterOptions: { mimeType: { contains: 'image' } },
              relationTo: 'media',
            },
          ],
        },
        {
          label: 'Catalog Presentation',
          fields: [
            {
              name: 'featuredProducts',
              type: 'relationship',
              hasMany: true,
              maxDepth: 1,
              relationTo: 'products' as CollectionSlug,
            },
            {
              name: 'defaultSort',
              type: 'select',
              defaultValue: 'popular',
              options: [
                { label: 'Popular', value: 'popular' },
                { label: 'Newest', value: 'newest' },
                { label: 'Price: Low to High', value: 'priceAscending' },
                { label: 'Price: High to Low', value: 'priceDescending' },
              ],
              required: true,
            },
            {
              name: 'showFilters',
              type: 'checkbox',
              defaultValue: true,
            },
            {
              name: 'availableFilterGroups',
              type: 'select',
              admin: {
                condition: (_, siblingData) => siblingData.showFilters === true,
              },
              defaultValue: ['price', 'color', 'size', 'brand', 'dressStyle'],
              hasMany: true,
              options: [
                { label: 'Price', value: 'price' },
                { label: 'Color', value: 'color' },
                { label: 'Size', value: 'size' },
                { label: 'Brand', value: 'brand' },
                { label: 'Dress Style', value: 'dressStyle' },
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
      name: 'parent',
      type: 'relationship',
      admin: {
        position: 'sidebar',
      },
      filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
      index: true,
      maxDepth: 1,
      relationTo: 'categories' as CollectionSlug,
    },
    {
      name: 'isVisible',
      type: 'checkbox',
      admin: {
        description: 'Kategori tersembunyi tidak tampil di storefront.',
        position: 'sidebar',
      },
      defaultValue: true,
    },
    {
      name: 'sortOrder',
      type: 'number',
      admin: {
        position: 'sidebar',
        step: 1,
      },
      defaultValue: 0,
      min: 0,
    },
  ],
  labels: {
    plural: 'Categories',
    singular: 'Category',
  },
  hooks: createCollectionRevalidationHooks('categories'),
  versions: {
    drafts: true,
    maxPerDoc: 50,
  },
}

export { Categories }
