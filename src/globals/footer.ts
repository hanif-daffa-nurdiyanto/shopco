import type { GlobalConfig } from 'payload'

import { editorOrAdmin, publicGlobalRead } from '@/access'
import { createGlobalRevalidationHook } from '@/hooks/revalidate-storefront'
import { getPreviewURL } from '@/libs/live-preview'

const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Footer',
  access: {
    read: publicGlobalRead,
    readVersions: editorOrAdmin,
    update: editorOrAdmin,
  },
  admin: {
    group: 'Site Settings',
    livePreview: {
      url: ({ req }) => getPreviewURL('footer', undefined, req),
    },
    preview: (_, { req }) => getPreviewURL('footer', undefined, req),
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Brand',
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
              name: 'brandDescription',
              type: 'textarea',
              maxLength: 320,
            },
            {
              name: 'socialLinks',
              type: 'array',
              admin: { initCollapsed: true },
              fields: [
                {
                  name: 'platform',
                  type: 'select',
                  options: [
                    { label: 'Facebook', value: 'facebook' },
                    { label: 'Instagram', value: 'instagram' },
                    { label: 'X / Twitter', value: 'twitter' },
                    { label: 'YouTube', value: 'youtube' },
                    { label: 'GitHub', value: 'github' },
                  ],
                  required: true,
                },
                { name: 'url', type: 'text', required: true },
                { name: 'label', type: 'text' },
              ],
              maxRows: 5,
            },
          ],
        },
        {
          label: 'Navigation',
          fields: [
            {
              name: 'linkGroups',
              type: 'array',
              admin: { initCollapsed: true },
              fields: [
                { name: 'heading', type: 'text', required: true },
                {
                  name: 'links',
                  type: 'array',
                  fields: [
                    { name: 'label', type: 'text', required: true },
                    { name: 'url', type: 'text', required: true },
                    { name: 'newTab', type: 'checkbox', defaultValue: false },
                  ],
                  maxRows: 6,
                  minRows: 1,
                  required: true,
                },
              ],
              maxRows: 4,
            },
          ],
        },
        {
          label: 'Newsletter',
          fields: [
            {
              name: 'newsletterHeading',
              type: 'text',
              admin: { condition: (data) => data.showNewsletter !== false },
            },
            {
              name: 'newsletterEmailPlaceholder',
              type: 'text',
              admin: { condition: (data) => data.showNewsletter !== false },
              defaultValue: 'Enter your email address',
            },
            {
              name: 'newsletterSubmitLabel',
              type: 'text',
              admin: { condition: (data) => data.showNewsletter !== false },
              defaultValue: 'Subscribe to Newsletter',
            },
            {
              name: 'newsletterSuccessMessage',
              type: 'text',
              admin: { condition: (data) => data.showNewsletter !== false },
            },
            {
              name: 'newsletterErrorMessage',
              type: 'text',
              admin: { condition: (data) => data.showNewsletter !== false },
            },
          ],
        },
        {
          label: 'Legal & Payments',
          fields: [
            { name: 'copyright', type: 'text' },
            {
              name: 'legalLinks',
              type: 'array',
              fields: [
                { name: 'label', type: 'text', required: true },
                { name: 'url', type: 'text', required: true },
              ],
              maxRows: 4,
            },
            {
              name: 'paymentMethods',
              type: 'array',
              admin: { initCollapsed: true },
              fields: [
                { name: 'name', type: 'text', required: true },
                {
                  name: 'logo',
                  type: 'upload',
                  filterOptions: { mimeType: { contains: 'image' } },
                  relationTo: 'media',
                  required: true,
                },
                { name: 'alt', type: 'text', required: true },
              ],
              maxRows: 6,
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
    {
      name: 'showNewsletter',
      type: 'checkbox',
      admin: { position: 'sidebar' },
      defaultValue: true,
    },
  ],
  hooks: {
    afterChange: [createGlobalRevalidationHook('footer')],
  },
  versions: {
    drafts: true,
    max: 50,
  },
}

export { Footer }
