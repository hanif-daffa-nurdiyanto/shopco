import type { CollectionSlug, Field, GroupField } from 'payload'

import { publishedCategoriesFilter, publishedProductsFilter } from './relationship-filters'

type CreateProductSelectorFieldOptions = {
  categoryRelationTo?: CollectionSlug
  defaultAutomaticSource?: 'featured' | 'newArrivals' | 'topSelling'
  label?: string
  name?: string
  overrides?: Partial<Omit<GroupField, 'fields' | 'name' | 'type'>>
  productRelationTo?: CollectionSlug
}

const createProductSelectorField = ({
  categoryRelationTo = 'categories' as CollectionSlug,
  defaultAutomaticSource = 'featured',
  label = 'Product Selection',
  name = 'productSelection',
  overrides = {},
  productRelationTo = 'products' as CollectionSlug,
}: CreateProductSelectorFieldOptions = {}): Field => ({
  name,
  type: 'group',
  label,
  ...overrides,
  fields: [
    {
      name: 'mode',
      type: 'radio',
      defaultValue: 'manual',
      options: [
        { label: 'Manual', value: 'manual' },
        { label: 'Automatic', value: 'automatic' },
      ],
      required: true,
    },
    {
      name: 'products',
      type: 'relationship',
      filterOptions: publishedProductsFilter,
      relationTo: productRelationTo,
      hasMany: true,
      admin: {
        condition: (_, siblingData) => siblingData.mode === 'manual',
      },
    },
    {
      name: 'automaticSource',
      type: 'select',
      admin: {
        condition: (_, siblingData) => siblingData.mode === 'automatic',
      },
      defaultValue: defaultAutomaticSource,
      options: [
        { label: 'Featured', value: 'featured' },
        { label: 'New arrivals', value: 'newArrivals' },
        { label: 'Top selling', value: 'topSelling' },
      ],
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: categoryRelationTo,
      admin: {
        condition: (_, siblingData) => siblingData.mode === 'automatic',
      },
      filterOptions: publishedCategoriesFilter,
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 4,
      max: 12,
      min: 1,
      required: true,
    },
  ],
})

export { createProductSelectorField }
export type { CreateProductSelectorFieldOptions }
