type PromotionType = 'fixed' | 'percentage'
type PromotionScope = 'all' | 'categories' | 'products'
type PromotionStatus = 'active' | 'exhausted' | 'expired' | 'inactive' | 'scheduled'

type CalculationLine = {
  categoryId?: null | number | string
  productId: number | string
  quantity: number
  unitPrice: number
}

type PromotionRule = {
  appliesTo?: PromotionScope | null
  categoryIds?: Array<number | string>
  endsAt?: null | string
  isActive?: boolean | null
  maximumDiscount?: null | number
  minimumSubtotal?: null | number
  productIds?: Array<number | string>
  startsAt?: null | string
  type: PromotionType
  usageLimit?: null | number
  usedCount?: null | number
  value: number
}

type DeliveryFeeOptions = {
  baseFee: number
  freeDeliveryThreshold?: null | number
}

type OrderCalculationInput = {
  delivery: DeliveryFeeOptions
  items: CalculationLine[]
  now?: Date
  promotion?: null | PromotionRule
  taxRate: number
}

type OrderTotals = {
  deliveryFee: number
  discount: number
  subtotal: number
  tax: number
  total: number
}

type PromotionEligibility = {
  eligible: boolean
  reason?: 'exhausted' | 'expired' | 'inactive' | 'minimumSubtotal' | 'notStarted' | 'scope'
}

export type {
  CalculationLine,
  DeliveryFeeOptions,
  OrderCalculationInput,
  OrderTotals,
  PromotionEligibility,
  PromotionRule,
  PromotionScope,
  PromotionStatus,
  PromotionType,
}
