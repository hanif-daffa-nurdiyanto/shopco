import type { Field, GroupField } from 'payload'

import { validateHexColor } from './validators'

type CreateColorFieldOptions = {
  label?: string
  name?: string
  overrides?: Partial<Omit<GroupField, 'fields' | 'name' | 'type'>>
}

const createColorField = ({
  label = 'Color',
  name = 'color',
  overrides = {},
}: CreateColorFieldOptions = {}): Field => ({
  name,
  type: 'group',
  label,
  ...overrides,
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'hex',
      type: 'text',
      admin: {
        placeholder: '#000000',
      },
      required: true,
      validate: validateHexColor,
    },
  ],
})

export { createColorField }
export type { CreateColorFieldOptions }
