import type { Field, GroupField } from 'payload'

type CreateSeoFieldOptions = {
  name?: string
  overrides?: Partial<Omit<GroupField, 'fields' | 'name' | 'type'>>
}

const createSeoField = ({
  name = 'meta',
  overrides = {},
}: CreateSeoFieldOptions = {}): Field => ({
  name,
  type: 'group',
  label: 'SEO',
  ...overrides,
  fields: [
    {
      name: 'title',
      type: 'text',
      maxLength: 60,
    },
    {
      name: 'description',
      type: 'textarea',
      maxLength: 160,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'canonicalUrl',
      type: 'text',
      admin: {
        placeholder: 'https://shop.co/path',
      },
    },
  ],
})

export { createSeoField }
export type { CreateSeoFieldOptions }
