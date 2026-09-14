import type { GlobalConfig } from 'payload'

import { adminOnly, anyone } from '@/access'
import { validateMoney, validatePositiveInteger } from '@/fields'
import { createGlobalRevalidationHook } from '@/hooks/revalidate-storefront'

const StoreSettings: GlobalConfig = {
  slug: 'store-settings',
  label: 'Store Settings',
  access: {
    read: anyone,
    update: adminOnly,
  },
  admin: {
    group: 'Site Settings',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          fields: [
            {
              name: 'storeName',
              type: 'text',
              defaultValue: 'SHOP.CO',
              required: true,
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'supportEmail',
                  type: 'email',
                  admin: { width: '50%' },
                },
                {
                  name: 'supportPhone',
                  type: 'text',
                  admin: { width: '50%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'locale',
                  type: 'text',
                  admin: { width: '50%' },
                  defaultValue: 'en-US',
                  required: true,
                },
                {
                  name: 'currency',
                  type: 'select',
                  admin: { width: '50%' },
                  defaultValue: 'USD',
                  options: [
                    { label: 'US Dollar (USD)', value: 'USD' },
                    { label: 'Indonesian Rupiah (IDR)', value: 'IDR' },
                  ],
                  required: true,
                },
              ],
            },
            {
              name: 'defaultProductImage',
              type: 'upload',
              filterOptions: { mimeType: { contains: 'image' } },
              relationTo: 'media',
            },
          ],
        },
        {
          label: 'Commerce',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'defaultDeliveryFee',
                  type: 'number',
                  admin: { step: 0.01, width: '50%' },
                  defaultValue: 15,
                  min: 0,
                  required: true,
                  validate: validateMoney,
                },
                {
                  name: 'freeShippingThreshold',
                  type: 'number',
                  admin: { step: 0.01, width: '50%' },
                  min: 0,
                  validate: validateMoney,
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'taxRate',
                  type: 'number',
                  admin: { step: 0.01, width: '50%' },
                  defaultValue: 0,
                  max: 100,
                  min: 0,
                  required: true,
                },
                {
                  name: 'pricesIncludeTax',
                  type: 'checkbox',
                  admin: { width: '50%' },
                  defaultValue: false,
                },
              ],
            },
            {
              name: 'cartSessionMinutes',
              type: 'number',
              admin: {
                description: 'Durasi cart session sebelum dianggap kedaluwarsa.',
                step: 1,
              },
              defaultValue: 1_440,
              min: 1,
              required: true,
              validate: validatePositiveInteger,
            },
          ],
        },
        {
          label: 'SEO Defaults',
          fields: [
            {
              name: 'titleTemplate',
              type: 'text',
              admin: { placeholder: '%s | SHOP.CO' },
              defaultValue: '%s | SHOP.CO',
              required: true,
            },
            {
              name: 'defaultDescription',
              type: 'textarea',
              maxLength: 160,
            },
            {
              name: 'defaultShareImage',
              type: 'upload',
              filterOptions: { mimeType: { contains: 'image' } },
              relationTo: 'media',
            },
          ],
        },
      ],
    },
    {
      name: 'maintenanceMode',
      type: 'checkbox',
      admin: {
        description: 'Gunakan hanya saat storefront harus dinonaktifkan sementara.',
        position: 'sidebar',
      },
      defaultValue: false,
    },
    {
      name: 'catalogEnabled',
      type: 'checkbox',
      admin: { position: 'sidebar' },
      defaultValue: true,
    },
  ],
  hooks: {
    afterChange: [createGlobalRevalidationHook('store-settings')],
  },
}

export { StoreSettings }
