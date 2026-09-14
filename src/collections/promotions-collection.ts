import type { CollectionConfig } from 'payload'

import { adminOnly, adminOnlyField } from '@/access'
import {
  validateEndDate,
  validateMoney,
  validatePositiveInteger,
  validatePromotionValue,
} from '@/fields'
import { getPromotionStatus, normalizePromotionCode } from '@/libs/commerce-calculations'
import type { PromotionRule } from '@/types/commerce'

const Promotions: CollectionConfig = {
  slug: 'promotions',
  access: {
    admin: adminOnlyField,
    create: adminOnly,
    delete: adminOnly,
    read: adminOnly,
    update: adminOnly,
  },
  admin: {
    defaultColumns: ['code', 'type', 'value', 'status', 'startsAt', 'endsAt', 'usedCount'],
    group: 'Commerce',
    listSearchableFields: ['code'],
    useAsTitle: 'code',
  },
  defaultSort: '-createdAt',
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Rules',
          fields: [
            {
              name: 'code',
              type: 'text',
              hooks: {
                beforeValidate: [({ value }) => normalizePromotionCode(value)],
              },
              index: true,
              required: true,
              unique: true,
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'type',
                  type: 'select',
                  admin: { width: '50%' },
                  defaultValue: 'percentage',
                  options: [
                    { label: 'Percentage', value: 'percentage' },
                    { label: 'Fixed amount', value: 'fixed' },
                  ],
                  required: true,
                },
                {
                  name: 'value',
                  type: 'number',
                  admin: { step: 0.01, width: '50%' },
                  min: 0,
                  required: true,
                  validate: (
                    value: null | number | undefined,
                    { siblingData }: { siblingData: Record<string, unknown> },
                  ) =>
                    validatePromotionValue(
                      value,
                      (siblingData as Record<string, unknown>).type as null | string | undefined,
                    ),
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'minimumSubtotal',
                  type: 'number',
                  admin: { step: 0.01, width: '50%' },
                  min: 0,
                  validate: validateMoney,
                },
                {
                  name: 'maximumDiscount',
                  type: 'number',
                  admin: {
                    condition: (data) => data.type === 'percentage',
                    step: 0.01,
                    width: '50%',
                  },
                  min: 0,
                  validate: validateMoney,
                },
              ],
            },
            {
              name: 'appliesTo',
              type: 'radio',
              admin: { layout: 'horizontal' },
              defaultValue: 'all',
              options: [
                { label: 'Entire order', value: 'all' },
                { label: 'Specific products', value: 'products' },
                { label: 'Specific categories', value: 'categories' },
              ],
              required: true,
            },
            {
              name: 'products',
              type: 'relationship',
              admin: {
                condition: (_, siblingData) => siblingData.appliesTo === 'products',
              },
              hasMany: true,
              maxDepth: 0,
              relationTo: 'products',
              validate: (value, { siblingData }) =>
                (siblingData as Record<string, unknown>).appliesTo !== 'products' ||
                (Array.isArray(value) && value.length > 0)
                  ? true
                  : 'Pilih minimal satu produk.',
            },
            {
              name: 'categories',
              type: 'relationship',
              admin: {
                condition: (_, siblingData) => siblingData.appliesTo === 'categories',
              },
              hasMany: true,
              maxDepth: 0,
              relationTo: 'categories',
              validate: (value, { siblingData }) =>
                (siblingData as Record<string, unknown>).appliesTo !== 'categories' ||
                (Array.isArray(value) && value.length > 0)
                  ? true
                  : 'Pilih minimal satu kategori.',
            },
          ],
        },
        {
          label: 'Validity & Usage',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'startsAt',
                  type: 'date',
                  admin: {
                    date: { pickerAppearance: 'dayAndTime' },
                    width: '50%',
                  },
                },
                {
                  name: 'endsAt',
                  type: 'date',
                  admin: {
                    date: { pickerAppearance: 'dayAndTime' },
                    width: '50%',
                  },
                  validate: (value, { siblingData }) =>
                    validateEndDate(
                      value,
                      (siblingData as Record<string, unknown>).startsAt as
                        | Date
                        | null
                        | string
                        | undefined,
                    ),
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'usageLimit',
                  type: 'number',
                  admin: { step: 1, width: '50%' },
                  min: 0,
                  validate: validatePositiveInteger,
                },
                {
                  name: 'usageLimitPerCustomer',
                  type: 'number',
                  admin: { step: 1, width: '50%' },
                  min: 0,
                  validate: validatePositiveInteger,
                },
              ],
            },
            {
              name: 'usedCount',
              type: 'number',
              access: {
                create: adminOnlyField,
                update: adminOnlyField,
              },
              admin: {
                description: 'Diperbarui oleh proses checkout, bukan input pelanggan.',
                readOnly: true,
              },
              defaultValue: 0,
              min: 0,
              required: true,
              validate: validatePositiveInteger,
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
      name: 'priority',
      type: 'number',
      admin: { position: 'sidebar', step: 1 },
      defaultValue: 0,
    },
    {
      name: 'status',
      type: 'select',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
      hooks: {
        afterRead: [({ siblingData }) => getPromotionStatus(siblingData as PromotionRule)],
      },
      options: [
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Active', value: 'active' },
        { label: 'Expired', value: 'expired' },
        { label: 'Exhausted', value: 'exhausted' },
        { label: 'Inactive', value: 'inactive' },
      ],
      virtual: true,
    },
  ],
  labels: {
    plural: 'Promotions',
    singular: 'Promotion',
  },
}

export { Promotions }
