import type { CollectionConfig, CollectionSlug } from 'payload'

import {
  adminOnly,
  approvedOrEditor,
  editorOrAdmin,
  editorOrAdminField,
} from '@/access'
import { validateRating } from '@/fields'
import { createCollectionRevalidationHooks } from '@/hooks/revalidate-storefront'

const reviewRevalidationHooks = createCollectionRevalidationHooks('reviews')

const Reviews: CollectionConfig = {
  slug: 'reviews',
  access: {
    create: editorOrAdmin,
    delete: adminOnly,
    read: approvedOrEditor,
    update: editorOrAdmin,
  },
  admin: {
    defaultColumns: ['authorName', 'product', 'rating', 'status', 'featured', 'createdAt'],
    group: 'Content',
    listSearchableFields: ['authorName', 'authorEmail', 'content'],
    useAsTitle: 'authorName',
  },
  defaultSort: '-createdAt',
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Review',
          fields: [
            {
              name: 'authorName',
              type: 'text',
              required: true,
            },
            {
              name: 'authorEmail',
              type: 'email',
              access: {
                read: editorOrAdminField,
              },
              required: true,
            },
            {
              name: 'content',
              type: 'textarea',
              maxLength: 2_000,
              minLength: 10,
              required: true,
            },
            {
              name: 'rating',
              type: 'number',
              admin: {
                step: 0.5,
              },
              max: 5,
              min: 1,
              required: true,
              validate: validateRating,
            },
            {
              name: 'verifiedPurchase',
              type: 'checkbox',
              defaultValue: false,
            },
          ],
        },
        {
          label: 'Moderation',
          fields: [
            {
              name: 'moderatorNotes',
              type: 'textarea',
              access: {
                read: editorOrAdminField,
              },
            },
            {
              name: 'moderatedBy',
              type: 'relationship',
              access: {
                read: editorOrAdminField,
              },
              maxDepth: 1,
              relationTo: 'users',
            },
            {
              name: 'moderatedAt',
              type: 'date',
              access: {
                read: editorOrAdminField,
              },
              admin: {
                date: {
                  pickerAppearance: 'dayAndTime',
                },
              },
            },
          ],
        },
      ],
    },
    {
      name: 'product',
      type: 'relationship',
      admin: {
        position: 'sidebar',
      },
      index: true,
      maxDepth: 1,
      relationTo: 'products' as CollectionSlug,
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      admin: {
        position: 'sidebar',
      },
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Spam', value: 'spam' },
      ],
      required: true,
    },
    {
      name: 'featured',
      type: 'checkbox',
      admin: {
        position: 'sidebar',
      },
      defaultValue: false,
    },
  ],
  labels: {
    plural: 'Reviews',
    singular: 'Review',
  },
  hooks: {
    afterChange: reviewRevalidationHooks.afterChange,
    afterDelete: reviewRevalidationHooks.afterDelete,
    beforeChange: [
      ({ data, req }) => {
        if (!['approved', 'rejected', 'spam'].includes(data.status)) return data

        return {
          ...data,
          moderatedAt: data.moderatedAt ?? new Date().toISOString(),
          moderatedBy: data.moderatedBy ?? req.user?.id,
        }
      },
    ],
  },
}

export { Reviews }
