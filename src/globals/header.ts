import type { GlobalConfig } from 'payload'

import { editorOrAdmin, publicGlobalRead } from '@/access'
import { publishedCategoriesFilter, validateEndDate } from '@/fields'
import { createGlobalRevalidationHook } from '@/hooks/revalidate-storefront'
import { getPreviewURL } from '@/libs/live-preview'

const Header: GlobalConfig = {
  slug: 'header',
  label: 'Header',
  access: {
    read: publicGlobalRead,
    readVersions: editorOrAdmin,
    update: editorOrAdmin,
  },
  admin: {
    group: 'Site Settings',
    livePreview: {
      url: ({ req }) => getPreviewURL('header', undefined, req),
    },
    preview: (_, { req }) => getPreviewURL('header', undefined, req),
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Announcement',
          fields: [
            {
              name: 'announcementEnabled',
              type: 'checkbox',
              defaultValue: true,
            },
            {
              name: 'announcementMessage',
              type: 'text',
              admin: {
                condition: (data) => data.announcementEnabled === true,
              },
              maxLength: 160,
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'announcementLinkLabel',
                  type: 'text',
                  admin: {
                    condition: (data) => data.announcementEnabled === true,
                    width: '50%',
                  },
                },
                {
                  name: 'announcementLinkUrl',
                  type: 'text',
                  admin: {
                    condition: (data) => data.announcementEnabled === true,
                    width: '50%',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'announcementStartsAt',
                  type: 'date',
                  admin: {
                    condition: (data) => data.announcementEnabled === true,
                    date: { pickerAppearance: 'dayAndTime' },
                    width: '50%',
                  },
                },
                {
                  name: 'announcementEndsAt',
                  type: 'date',
                  admin: {
                    condition: (data) => data.announcementEnabled === true,
                    date: { pickerAppearance: 'dayAndTime' },
                    width: '50%',
                  },
                  validate: (value, { siblingData }) =>
                    validateEndDate(
                      value,
                      (siblingData as Record<string, unknown>).announcementStartsAt as
                        | Date
                        | null
                        | string
                        | undefined,
                    ),
                },
              ],
            },
          ],
        },
        {
          label: 'Navigation',
          fields: [
            {
              name: 'logoType',
              type: 'radio',
              admin: { layout: 'horizontal' },
              defaultValue: 'text',
              options: [
                { label: 'Text', value: 'text' },
                { label: 'Image', value: 'image' },
              ],
              required: true,
            },
            {
              name: 'logoText',
              type: 'text',
              admin: { condition: (data) => data.logoType === 'text' },
              defaultValue: 'SHOP.CO',
            },
            {
              name: 'logoImage',
              type: 'upload',
              admin: { condition: (data) => data.logoType === 'image' },
              filterOptions: { mimeType: { contains: 'image' } },
              relationTo: 'media',
            },
            {
              name: 'navigationItems',
              type: 'array',
              admin: { initCollapsed: true },
              fields: [
                { name: 'label', type: 'text', required: true },
                {
                  name: 'type',
                  type: 'radio',
                  admin: { layout: 'horizontal' },
                  defaultValue: 'internal',
                  options: [
                    { label: 'Category', value: 'internal' },
                    { label: 'Custom URL', value: 'external' },
                  ],
                  required: true,
                },
                {
                  name: 'category',
                  type: 'relationship',
                  admin: { condition: (_, siblingData) => siblingData.type === 'internal' },
                  filterOptions: publishedCategoriesFilter,
                  maxDepth: 1,
                  relationTo: 'categories',
                },
                {
                  name: 'url',
                  type: 'text',
                  admin: { condition: (_, siblingData) => siblingData.type === 'external' },
                },
                {
                  name: 'newTab',
                  type: 'checkbox',
                  defaultValue: false,
                },
                {
                  name: 'children',
                  type: 'array',
                  admin: { initCollapsed: true },
                  fields: [
                    { name: 'label', type: 'text', required: true },
                    { name: 'url', type: 'text', required: true },
                  ],
                  maxRows: 4,
                },
              ],
              maxRows: 6,
            },
          ],
        },
        {
          label: 'Actions',
          fields: [
            {
              name: 'searchPlaceholder',
              type: 'text',
              defaultValue: 'Search for products...',
              required: true,
            },
            {
              name: 'cartLabel',
              type: 'text',
              defaultValue: 'Open cart',
              required: true,
            },
            {
              name: 'accountLabel',
              type: 'text',
              defaultValue: 'Open account',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'isActive',
      type: 'checkbox',
      admin: { position: 'sidebar' },
      defaultValue: true,
    },
  ],
  hooks: {
    afterChange: [createGlobalRevalidationHook('header')],
  },
  versions: {
    drafts: true,
    max: 50,
  },
}

export { Header }
