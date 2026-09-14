import type { NumberField, RowField } from 'payload'

import { validateCompareAtPrice, validateMoney } from './validators'

type CreateMoneyFieldsOptions = {
  includeCompareAtPrice?: boolean
  priceName?: string
}

const createMoneyFields = ({
  includeCompareAtPrice = true,
  priceName = 'price',
}: CreateMoneyFieldsOptions = {}): RowField => {
  const compareAtPriceField: NumberField = {
    name: 'compareAtPrice',
    type: 'number',
    admin: {
      description: 'Harga awal sebelum diskon.',
      step: 0.01,
      width: '50%',
    },
    min: 0,
    validate: (value, { siblingData }) =>
      validateCompareAtPrice(
        value,
        (siblingData as Record<string, unknown>)[priceName] as null | number | undefined,
      ),
  }

  return {
    type: 'row',
    fields: [
      {
        name: priceName,
        type: 'number',
        admin: {
          description: 'Simpan dalam unit mata uang utama, bukan sen.',
          step: 0.01,
          width: '50%',
        },
        min: 0,
        required: true,
        validate: validateMoney,
      },
      ...(includeCompareAtPrice ? [compareAtPriceField] : []),
    ],
  }
}

export { createMoneyFields }
export type { CreateMoneyFieldsOptions }
