import type { CollectionSlug, Field, GroupField } from 'payload'

type CreateLinkFieldOptions = {
  label?: string
  name?: string
  overrides?: Partial<Omit<GroupField, 'fields' | 'name' | 'type'>>
  relationTo: CollectionSlug
}

const createLinkField = ({
  label = 'Link',
  name = 'link',
  overrides = {},
  relationTo,
}: CreateLinkFieldOptions): Field => ({
  name,
  type: 'group',
  label,
  ...overrides,
  admin: {
    description: 'Pilih halaman internal atau masukkan URL eksternal.',
    ...overrides.admin,
  },
  fields: [
    {
      name: 'type',
      type: 'radio',
      defaultValue: 'internal',
      options: [
        { label: 'Internal', value: 'internal' },
        { label: 'External', value: 'external' },
      ],
      required: true,
    },
    {
      name: 'label',
      type: 'text',
      required: true,
    },
    {
      name: 'reference',
      type: 'relationship',
      relationTo,
      admin: {
        condition: (_, siblingData) => siblingData.type === 'internal',
      },
    },
    {
      name: 'url',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData.type === 'external',
        placeholder: 'https://example.com',
      },
    },
    {
      name: 'newTab',
      type: 'checkbox',
      defaultValue: false,
      label: 'Buka di tab baru',
    },
  ],
})

export { createLinkField }
export type { CreateLinkFieldOptions }
