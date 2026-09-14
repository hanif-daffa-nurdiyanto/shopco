import type { GlobalConfig } from 'payload'

import { editorOrAdmin, publicGlobalRead } from '@/access'
import {
  createProductSelectorField,
  createSeoField,
  featuredReviewsFilter,
  publishedBrandsFilter,
  publishedCategoriesFilter,
} from '@/fields'
import { createGlobalRevalidationHook } from '@/hooks/revalidate-storefront'
import { getPreviewURL } from '@/libs/live-preview'

const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: 'Homepage',
  access: {
    read: publicGlobalRead,
    readVersions: editorOrAdmin,
    update: editorOrAdmin,
  },
  admin: {
    group: 'Pages',
    livePreview: {
      url: ({ req }) => getPreviewURL('homepage', undefined, req),
    },
    preview: (_, { req }) => getPreviewURL('homepage', undefined, req),
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero',
          fields: [
            {
              name: 'heroHeading',
              type: 'text',
              required: true,
            },
            {
              name: 'heroDescription',
              type: 'textarea',
              maxLength: 320,
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'heroCtaLabel',
                  type: 'text',
                  admin: { width: '50%' },
                },
                {
                  name: 'heroCtaUrl',
                  type: 'text',
                  admin: { width: '50%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'heroImage',
                  type: 'upload',
                  admin: { width: '50%' },
                  filterOptions: { mimeType: { contains: 'image' } },
                  relationTo: 'media',
                  required: true,
                },
                {
                  name: 'heroMobileImage',
                  type: 'upload',
                  admin: { width: '50%' },
                  filterOptions: { mimeType: { contains: 'image' } },
                  relationTo: 'media',
                },
              ],
            },
            {
              name: 'statistics',
              type: 'array',
              fields: [
                { name: 'value', type: 'text', required: true },
                { name: 'label', type: 'text', required: true },
              ],
              maxRows: 3,
            },
          ],
        },
        {
          label: 'Brands',
          fields: [
            { name: 'brandsHeading', type: 'text' },
            {
              name: 'brands',
              type: 'relationship',
              filterOptions: publishedBrandsFilter,
              hasMany: true,
              maxDepth: 1,
              relationTo: 'brands',
              validate: (value) =>
                !Array.isArray(value) || value.length <= 8
                  ? true
                  : 'Homepage hanya mendukung maksimal 8 brand.',
            },
          ],
        },
        {
          label: 'Product Sections',
          fields: [
            {
              name: 'newArrivalsHeading',
              type: 'text',
              defaultValue: 'NEW ARRIVALS',
            },
            createProductSelectorField({
              defaultAutomaticSource: 'newArrivals',
              label: 'New Arrivals Products',
              name: 'newArrivals',
            }),
            {
              name: 'topSellingHeading',
              type: 'text',
              defaultValue: 'TOP SELLING',
            },
            createProductSelectorField({
              defaultAutomaticSource: 'topSelling',
              label: 'Top Selling Products',
              name: 'topSelling',
            }),
          ],
        },
        {
          label: 'Dress Styles',
          fields: [
            {
              name: 'dressStylesHeading',
              type: 'text',
              defaultValue: 'BROWSE BY DRESS STYLE',
            },
            {
              name: 'dressStyles',
              type: 'array',
              admin: { initCollapsed: true },
              fields: [
                { name: 'label', type: 'text', required: true },
                {
                  name: 'image',
                  type: 'upload',
                  filterOptions: { mimeType: { contains: 'image' } },
                  relationTo: 'media',
                  required: true,
                },
                {
                  name: 'category',
                  type: 'relationship',
                  filterOptions: publishedCategoriesFilter,
                  maxDepth: 1,
                  relationTo: 'categories',
                  required: true,
                },
              ],
              maxRows: 4,
            },
          ],
        },
        {
          label: 'Testimonials',
          fields: [
            {
              name: 'testimonialsHeading',
              type: 'text',
              defaultValue: 'OUR HAPPY CUSTOMERS',
            },
            {
              name: 'testimonials',
              type: 'relationship',
              filterOptions: featuredReviewsFilter,
              hasMany: true,
              maxDepth: 1,
              relationTo: 'reviews',
              validate: (value) =>
                !Array.isArray(value) || value.length <= 12
                  ? true
                  : 'Homepage hanya mendukung maksimal 12 testimonial.',
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            createSeoField(),
            {
              name: 'structuredDataEnabled',
              type: 'checkbox',
              defaultValue: true,
            },
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
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
  hooks: {
    afterChange: [createGlobalRevalidationHook('homepage')],
  },
  versions: {
    drafts: true,
    max: 50,
  },
}

export { Homepage }
