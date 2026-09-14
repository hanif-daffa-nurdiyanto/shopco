import { APIError, type CollectionConfig } from 'payload'

import { adminOnly, adminOnlyField, adminOrCustomerOwnOrders } from '@/access'
import { validateMoney } from '@/fields'
import {
  calculateLineTotal,
  calculateOrderTotals,
  generateOrderNumber,
} from '@/libs/commerce-calculations'
import type { CalculationLine, PromotionRule } from '@/types/commerce'

type RelationshipValue = { id: number | string } | number | string

const getRelationshipId = (value: null | RelationshipValue | undefined) =>
  value && typeof value === 'object' ? value.id : value

const getRelationshipIds = (values: null | RelationshipValue[] | undefined) =>
  values?.map(getRelationshipId).filter((id): id is number | string => id != null) ?? []

const immutableOrderFields = [
  'idempotencyKey',
  'items',
  'subtotal',
  'discount',
  'deliveryFee',
  'taxRate',
  'tax',
  'total',
] as const

const Orders: CollectionConfig = {
  slug: 'orders',
  access: {
    admin: adminOnlyField,
    create: adminOnly,
    delete: adminOnly,
    read: adminOrCustomerOwnOrders,
    update: adminOnly,
  },
  admin: {
    defaultColumns: [
      'orderNumber',
      'customerEmail',
      'total',
      'paymentStatus',
      'fulfillmentStatus',
      'createdAt',
    ],
    group: 'Commerce',
    listSearchableFields: ['orderNumber', 'customerEmail', 'customerName'],
    useAsTitle: 'orderNumber',
  },
  defaultSort: '-createdAt',
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Items',
          fields: [
            {
              name: 'items',
              type: 'array',
              access: {
                update: () => false,
              },
              admin: {
                description: 'Snapshot item dikunci setelah order dibuat.',
                initCollapsed: true,
              },
              fields: [
                {
                  name: 'product',
                  type: 'relationship',
                  maxDepth: 0,
                  relationTo: 'products',
                },
                {
                  name: 'productSnapshotId',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'categoryId',
                  type: 'text',
                },
                {
                  name: 'productName',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'sku',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'variant',
                  type: 'group',
                  fields: [
                    { name: 'id', type: 'text' },
                    { name: 'color', type: 'text' },
                    { name: 'size', type: 'text' },
                  ],
                },
                {
                  name: 'quantity',
                  type: 'number',
                  min: 1,
                  required: true,
                  validate: (value: null | number | undefined) =>
                    Number.isInteger(value) && value != null && value > 0
                      ? true
                      : 'Quantity harus berupa bilangan bulat positif.',
                },
                {
                  name: 'unitPrice',
                  type: 'number',
                  min: 0,
                  required: true,
                  validate: validateMoney,
                },
                {
                  name: 'lineTotal',
                  type: 'number',
                  admin: { readOnly: true },
                  min: 0,
                  required: true,
                  validate: validateMoney,
                },
              ],
              minRows: 1,
              required: true,
            },
          ],
        },
        {
          label: 'Customer & Shipping',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'customerName',
                  type: 'text',
                  admin: { width: '50%' },
                  required: true,
                },
                {
                  name: 'customerEmail',
                  type: 'email',
                  admin: { width: '50%' },
                  index: true,
                  required: true,
                },
              ],
            },
            {
              name: 'customerPhone',
              type: 'text',
            },
            {
              name: 'shippingAddress',
              type: 'group',
              fields: [
                { name: 'recipientName', type: 'text', required: true },
                { name: 'line1', type: 'text', required: true },
                { name: 'line2', type: 'text' },
                {
                  type: 'row',
                  fields: [
                    { name: 'city', type: 'text', admin: { width: '50%' }, required: true },
                    { name: 'province', type: 'text', admin: { width: '50%' }, required: true },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'postalCode',
                      type: 'text',
                      admin: { width: '50%' },
                      required: true,
                    },
                    {
                      name: 'country',
                      type: 'text',
                      admin: { width: '50%' },
                      defaultValue: 'Indonesia',
                      required: true,
                    },
                  ],
                },
              ],
              required: true,
            },
            {
              name: 'billingSameAsShipping',
              type: 'checkbox',
              defaultValue: true,
            },
            {
              name: 'billingAddress',
              type: 'group',
              admin: {
                condition: (_, siblingData) => siblingData.billingSameAsShipping === false,
              },
              fields: [
                { name: 'recipientName', type: 'text' },
                { name: 'line1', type: 'text' },
                { name: 'line2', type: 'text' },
                { name: 'city', type: 'text' },
                { name: 'province', type: 'text' },
                { name: 'postalCode', type: 'text' },
                { name: 'country', type: 'text', defaultValue: 'Indonesia' },
              ],
            },
            {
              name: 'deliveryMethod',
              type: 'select',
              defaultValue: 'standard',
              options: [
                { label: 'Standard', value: 'standard' },
                { label: 'Express', value: 'express' },
                { label: 'Pickup', value: 'pickup' },
              ],
              required: true,
            },
          ],
        },
        {
          label: 'Payment',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'paymentProvider',
                  type: 'select',
                  admin: { width: '50%' },
                  options: [
                    { label: 'Manual', value: 'manual' },
                    { label: 'Stripe', value: 'stripe' },
                    { label: 'Midtrans', value: 'midtrans' },
                  ],
                },
                {
                  name: 'paymentReference',
                  type: 'text',
                  access: { read: adminOnlyField },
                  admin: { width: '50%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'subtotal',
                  type: 'number',
                  admin: { readOnly: true, width: '50%' },
                  min: 0,
                  required: true,
                  validate: validateMoney,
                },
                {
                  name: 'discount',
                  type: 'number',
                  admin: { readOnly: true, width: '50%' },
                  min: 0,
                  required: true,
                  validate: validateMoney,
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'deliveryFee',
                  type: 'number',
                  admin: { readOnly: true, width: '50%' },
                  defaultValue: 0,
                  min: 0,
                  required: true,
                  validate: validateMoney,
                },
                {
                  name: 'taxRate',
                  type: 'number',
                  admin: { readOnly: true, step: 0.01, width: '50%' },
                  defaultValue: 0,
                  max: 100,
                  min: 0,
                  required: true,
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'tax',
                  type: 'number',
                  admin: { readOnly: true, width: '50%' },
                  min: 0,
                  required: true,
                  validate: validateMoney,
                },
                {
                  name: 'total',
                  type: 'number',
                  admin: { readOnly: true, width: '50%' },
                  index: true,
                  min: 0,
                  required: true,
                  validate: validateMoney,
                },
              ],
            },
          ],
        },
        {
          label: 'Timeline',
          fields: [
            {
              name: 'timeline',
              type: 'array',
              admin: { initCollapsed: true },
              fields: [
                {
                  name: 'status',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'message',
                  type: 'textarea',
                  required: true,
                },
                {
                  name: 'occurredAt',
                  type: 'date',
                  admin: { date: { pickerAppearance: 'dayAndTime' } },
                  defaultValue: () => new Date().toISOString(),
                  required: true,
                },
              ],
            },
            {
              name: 'internalNotes',
              type: 'textarea',
              access: { read: adminOnlyField },
            },
          ],
        },
      ],
    },
    {
      name: 'idempotencyKey',
      type: 'text',
      admin: {
        description: 'Kunci retry checkout. Dibuat oleh storefront dan tidak dapat diubah.',
        position: 'sidebar',
        readOnly: true,
      },
      index: true,
      unique: true,
    },
    {
      name: 'orderNumber',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
      hooks: {
        beforeValidate: [({ operation, value }) =>
          operation === 'create' && !value ? generateOrderNumber() : value,
        ],
      },
      index: true,
      unique: true,
    },
    {
      name: 'paymentStatus',
      type: 'select',
      admin: { position: 'sidebar' },
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Paid', value: 'paid' },
        { label: 'Failed', value: 'failed' },
        { label: 'Refunded', value: 'refunded' },
      ],
      required: true,
    },
    {
      name: 'fulfillmentStatus',
      type: 'select',
      admin: { position: 'sidebar' },
      defaultValue: 'unfulfilled',
      options: [
        { label: 'Unfulfilled', value: 'unfulfilled' },
        { label: 'Processing', value: 'processing' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      required: true,
    },
    {
      name: 'customer',
      type: 'relationship',
      admin: { position: 'sidebar' },
      index: true,
      maxDepth: 0,
      relationTo: 'users',
    },
    {
      name: 'promotion',
      type: 'relationship',
      admin: { position: 'sidebar' },
      maxDepth: 0,
      relationTo: 'promotions',
    },
  ],
  labels: {
    plural: 'Orders',
    singular: 'Order',
  },
  hooks: {
    beforeChange: [
      async ({ data, operation, originalDoc, req }) => {
        if (operation === 'update') {
          const currentData = data as Record<string, unknown>
          const previousData = originalDoc as Record<string, unknown> | undefined
          const attemptedImmutableUpdate = immutableOrderFields.some(
            (field) =>
              currentData[field] !== undefined &&
              JSON.stringify(currentData[field]) !== JSON.stringify(previousData?.[field]),
          )

          if (attemptedImmutableUpdate) {
            throw new APIError('Order item snapshots and totals cannot be modified.', 400)
          }

          if (data.timeline && originalDoc?.timeline) {
            const previousTimeline = JSON.stringify(originalDoc.timeline)
            const nextTimelinePrefix = JSON.stringify(data.timeline.slice(0, originalDoc.timeline.length))

            if (previousTimeline !== nextTimelinePrefix) {
              throw new APIError('Order timeline is append-only.', 400)
            }
          }

          return data
        }

        const sourceItems = (data.items ?? []) as Array<Record<string, unknown>>
        const items: Array<Record<string, unknown>> = sourceItems.map((item) => ({
          ...item,
          lineTotal: calculateLineTotal({
            productId: String(item.productSnapshotId),
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
          }),
        }))
        const calculationItems: CalculationLine[] = items.map((item) => ({
          categoryId: item.categoryId == null ? undefined : String(item.categoryId),
          productId: String(item.productSnapshotId),
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        }))

        const promotionId = getRelationshipId(data.promotion as RelationshipValue | undefined)
        let promotion: PromotionRule | undefined

        if (promotionId != null) {
          const promotionDocument = await req.payload.findByID({
            collection: 'promotions',
            depth: 0,
            id: promotionId,
            overrideAccess: true,
            req,
          })

          promotion = {
            appliesTo: promotionDocument.appliesTo,
            categoryIds: getRelationshipIds(
              promotionDocument.categories as RelationshipValue[] | undefined,
            ),
            endsAt: promotionDocument.endsAt,
            isActive: promotionDocument.isActive,
            maximumDiscount: promotionDocument.maximumDiscount,
            minimumSubtotal: promotionDocument.minimumSubtotal,
            productIds: getRelationshipIds(
              promotionDocument.products as RelationshipValue[] | undefined,
            ),
            startsAt: promotionDocument.startsAt,
            type: promotionDocument.type,
            usageLimit: promotionDocument.usageLimit,
            usedCount: promotionDocument.usedCount,
            value: promotionDocument.value,
          }
        }

        const totals = calculateOrderTotals({
          delivery: {
            baseFee: Number(data.deliveryFee ?? 0),
          },
          items: calculationItems,
          promotion,
          taxRate: Number(data.taxRate ?? 0),
        })

        return {
          ...data,
          ...totals,
          items,
        }
      },
    ],
  },
}

export { Orders }
