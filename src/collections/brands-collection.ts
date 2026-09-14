import type { CollectionConfig } from 'payload'

import { editorOrAdmin, publishedOrEditorWith } from '@/access'
import { createSlugField } from '@/fields'
import { createCollectionRevalidationHooks } from '@/hooks/revalidate-storefront'

const Brands: CollectionConfig = {
  slug: 'brands',
  access: {
    create: editorOrAdmin,
    delete: editorOrAdmin,
    read: publishedOrEditorWith({ isActive: { equals: true } }),
    update: editorOrAdmin,
  },
  admin: {
    defaultColumns: ['name', 'isFeatured', 'sortOrder', 'isActive', '_status', 'updatedAt'],
    group: 'Content',
    listSearchableFields: ['name', 'slug'],
    useAsTitle: 'name',
  },
  defaultSort: 'sortOrder',
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
              name: 'description',
              type: 'textarea',
            },
            {
              name: 'website',
              type: 'text',
              admin: {
                placeholder: 'https://brand.example',
              },
            },
          ],
        },
        {
          label: 'Media',
          fields: [
            {
              name: 'logo',
              type: 'upload',
              filterOptions: { mimeType: { contains: 'image' } },
              relationTo: 'media',
              required: true,
            },
            {
              name: 'logoLight',
              type: 'upload',
              filterOptions: { mimeType: { contains: 'image' } },
              relationTo: 'media',
            },
          ],
        },
      ],
    },
    createSlugField({ useAsSlug: 'name' }),
    {
      name: 'isFeatured',
      type: 'checkbox',
      admin: {
        description: 'Tampilkan brand pada brand strip storefront.',
        position: 'sidebar',
      },
      defaultValue: false,
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
    {
      name: 'isActive',
      type: 'checkbox',
      admin: {
        description: 'Brand nonaktif tidak tampil di storefront.',
        position: 'sidebar',
      },
      defaultValue: true,
    },
  ],
  labels: {
    plural: 'Brands',
    singular: 'Brand',
  },
  hooks: createCollectionRevalidationHooks('brands'),
  versions: {
    drafts: true,
    maxPerDoc: 25,
  },
}

export { Brands }
