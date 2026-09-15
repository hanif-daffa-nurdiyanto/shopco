type CartSessionItem = {
  productId: number
  quantity: number
  variantId: null | string
}

type CartSession = {
  expiresAt: string
  items: CartSessionItem[]
}

type CartIssueCode =
  | 'inactiveVariant'
  | 'insufficientStock'
  | 'invalidItem'
  | 'productUnavailable'
  | 'variantRequired'
  | 'variantUnavailable'

type CartIssue = {
  code: CartIssueCode
  message: string
  productId?: number
  variantId?: null | string
}

type ResolvedCartItem = CartSessionItem & {
  available: boolean
  availableStock: null | number
  categoryId: null | number
  color: null | string
  image: string
  key: string
  lineTotal: number
  name: string
  price: number
  size: null | string
  sku: string
}

type ResolvedCart = {
  issues: CartIssue[]
  items: ResolvedCartItem[]
  subtotal: number
}

type CartPricingConfig = {
  baseDeliveryFee: number
  freeDeliveryThreshold?: null | number
}

type CartPromotionResult = {
  promotion: {
    code: string
    type: 'fixed' | 'percentage'
    value: number
  }
  totals: {
    deliveryFee: number
    discount: number
    subtotal: number
    tax: number
    total: number
  }
}

type CheckoutAddress = {
  city: string
  country: string
  line1: string
  line2?: string
  postalCode: string
  province: string
  recipientName: string
}

type CheckoutInput = {
  customer: {
    email: string
    name: string
    phone?: string
  }
  deliveryMethod: 'express' | 'pickup' | 'standard'
  idempotencyKey: string
  paymentProvider: 'manual'
  promoCode?: string
  shippingAddress: CheckoutAddress
}

type CheckoutResult = {
  idempotentReplay: boolean
  order: {
    id: number
    orderNumber: null | string
    totals: {
      deliveryFee: number
      discount: number
      subtotal: number
      tax: number
      total: number
    }
  }
}

export type {
  CartIssue,
  CartIssueCode,
  CartPricingConfig,
  CartPromotionResult,
  CartSession,
  CartSessionItem,
  CheckoutAddress,
  CheckoutInput,
  CheckoutResult,
  ResolvedCart,
  ResolvedCartItem,
}
