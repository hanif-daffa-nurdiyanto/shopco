import { slugField as createPayloadSlugField } from 'payload'

type PayloadSlugFieldOptions = NonNullable<Parameters<typeof createPayloadSlugField>[0]>

type CreateSlugFieldOptions = Omit<PayloadSlugFieldOptions, 'position'> & {
  position?: 'sidebar'
}

const createSlugField = ({
  position = 'sidebar',
  required = true,
  useAsSlug = 'name',
  ...options
}: CreateSlugFieldOptions = {}) =>
  createPayloadSlugField({
    ...options,
    position,
    required,
    useAsSlug,
  })

export { createSlugField }
export type { CreateSlugFieldOptions }
