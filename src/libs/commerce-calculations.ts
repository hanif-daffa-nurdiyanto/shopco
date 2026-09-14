import type {
  CalculationLine,
  DeliveryFeeOptions,
  OrderCalculationInput,
  OrderTotals,
  PromotionEligibility,
  PromotionRule,
  PromotionStatus,
} from '@/types/commerce'

const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100

const normalizePromotionCode = (value: unknown) =>
  typeof value === 'string' ? value.trim().toUpperCase() : value

const calculateLineTotal = ({ quantity, unitPrice }: CalculationLine) =>
  roundMoney(Math.max(quantity, 0) * Math.max(unitPrice, 0))

const calculateSubtotal = (items: CalculationLine[]) =>
  roundMoney(items.reduce((subtotal, item) => subtotal + calculateLineTotal(item), 0))

const normalizeRelationshipIds = (values: Array<number | string> = []) =>
  new Set(values.map(String))

const calculateEligibleSubtotal = (items: CalculationLine[], promotion: PromotionRule) => {
  if (!promotion.appliesTo || promotion.appliesTo === 'all') return calculateSubtotal(items)

  const eligibleIds = normalizeRelationshipIds(
    promotion.appliesTo === 'products' ? promotion.productIds : promotion.categoryIds,
  )

  return calculateSubtotal(
    items.filter((item) =>
      promotion.appliesTo === 'products'
        ? eligibleIds.has(String(item.productId))
        : item.categoryId != null && eligibleIds.has(String(item.categoryId)),
    ),
  )
}

const getPromotionEligibility = (
  promotion: PromotionRule,
  items: CalculationLine[],
  now = new Date(),
): PromotionEligibility => {
  if (!promotion.isActive) return { eligible: false, reason: 'inactive' }
  if (promotion.startsAt && now < new Date(promotion.startsAt)) {
    return { eligible: false, reason: 'notStarted' }
  }
  if (promotion.endsAt && now > new Date(promotion.endsAt)) {
    return { eligible: false, reason: 'expired' }
  }
  if (promotion.usageLimit != null && (promotion.usedCount ?? 0) >= promotion.usageLimit) {
    return { eligible: false, reason: 'exhausted' }
  }

  const subtotal = calculateSubtotal(items)
  if (subtotal < (promotion.minimumSubtotal ?? 0)) {
    return { eligible: false, reason: 'minimumSubtotal' }
  }
  if (calculateEligibleSubtotal(items, promotion) === 0) {
    return { eligible: false, reason: 'scope' }
  }

  return { eligible: true }
}

const calculateDiscount = (
  items: CalculationLine[],
  promotion?: null | PromotionRule,
  now = new Date(),
) => {
  if (!promotion || !getPromotionEligibility(promotion, items, now).eligible) return 0

  const eligibleSubtotal = calculateEligibleSubtotal(items, promotion)
  const rawDiscount =
    promotion.type === 'percentage'
      ? eligibleSubtotal * (promotion.value / 100)
      : promotion.value
  const cappedDiscount = Math.min(
    rawDiscount,
    promotion.maximumDiscount ?? rawDiscount,
    eligibleSubtotal,
  )

  return roundMoney(Math.max(cappedDiscount, 0))
}

const calculateDeliveryFee = (subtotal: number, options: DeliveryFeeOptions) =>
  options.freeDeliveryThreshold != null && subtotal >= options.freeDeliveryThreshold
    ? 0
    : roundMoney(Math.max(options.baseFee, 0))

const calculateTax = (taxableAmount: number, taxRate: number) =>
  roundMoney(Math.max(taxableAmount, 0) * (Math.max(taxRate, 0) / 100))

const calculateOrderTotals = ({
  delivery,
  items,
  now,
  promotion,
  taxRate,
}: OrderCalculationInput): OrderTotals => {
  const subtotal = calculateSubtotal(items)
  const discount = calculateDiscount(items, promotion, now)
  const deliveryFee = calculateDeliveryFee(subtotal, delivery)
  const tax = calculateTax(subtotal - discount, taxRate)

  return {
    deliveryFee,
    discount,
    subtotal,
    tax,
    total: roundMoney(subtotal - discount + deliveryFee + tax),
  }
}

const getPromotionStatus = (
  promotion: Pick<
    PromotionRule,
    'endsAt' | 'isActive' | 'startsAt' | 'usageLimit' | 'usedCount'
  >,
  now = new Date(),
): PromotionStatus => {
  if (!promotion.isActive) return 'inactive'
  if (promotion.usageLimit != null && (promotion.usedCount ?? 0) >= promotion.usageLimit) {
    return 'exhausted'
  }
  if (promotion.startsAt && now < new Date(promotion.startsAt)) return 'scheduled'
  if (promotion.endsAt && now > new Date(promotion.endsAt)) return 'expired'

  return 'active'
}

const generateOrderNumber = (date = new Date(), suffix = crypto.randomUUID().slice(0, 8)) => {
  const datePart = date.toISOString().slice(0, 10).replaceAll('-', '')

  return `ORD-${datePart}-${suffix.toUpperCase()}`
}

export {
  calculateDeliveryFee,
  calculateDiscount,
  calculateEligibleSubtotal,
  calculateLineTotal,
  calculateOrderTotals,
  calculateSubtotal,
  calculateTax,
  generateOrderNumber,
  getPromotionEligibility,
  getPromotionStatus,
  normalizePromotionCode,
  roundMoney,
}
