import type { CheckoutAddress, CheckoutInput } from '@/types/cart'

class CheckoutValidationError extends Error {
  status: number

  constructor(message: string, status = 400) {
    super(message)
    this.name = 'CheckoutValidationError'
    this.status = status
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const readText = (value: unknown, label: string, maxLength: number, optional = false) => {
  if (optional && (value == null || value === '')) return undefined
  if (typeof value !== 'string' || !value.trim() || value.trim().length > maxLength) {
    throw new CheckoutValidationError(`${label} is invalid.`)
  }

  return value.trim()
}

const parseAddress = (value: unknown): CheckoutAddress => {
  if (!isRecord(value)) throw new CheckoutValidationError('Shipping address is required.')

  return {
    city: readText(value.city, 'City', 100)!,
    country: readText(value.country, 'Country', 100)!,
    line1: readText(value.line1, 'Address', 200)!,
    line2: readText(value.line2, 'Address line 2', 200, true),
    postalCode: readText(value.postalCode, 'Postal code', 20)!,
    province: readText(value.province, 'Province', 100)!,
    recipientName: readText(value.recipientName, 'Recipient name', 120)!,
  }
}

const parseCheckoutInput = (value: unknown): CheckoutInput => {
  if (!isRecord(value) || !isRecord(value.customer)) {
    throw new CheckoutValidationError('Checkout payload is invalid.')
  }

  const email = readText(value.customer.email, 'Email', 254)!
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new CheckoutValidationError('Email is invalid.')
  }

  const idempotencyKey = readText(value.idempotencyKey, 'Idempotency key', 100)!
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]{15,99}$/.test(idempotencyKey)) {
    throw new CheckoutValidationError('Idempotency key is invalid.')
  }

  const allowedDeliveryMethods = ['express', 'pickup', 'standard'] as const
  if (!allowedDeliveryMethods.includes(value.deliveryMethod as (typeof allowedDeliveryMethods)[number])) {
    throw new CheckoutValidationError('Delivery method is invalid.')
  }
  if (value.paymentProvider !== 'manual') {
    throw new CheckoutValidationError('Payment provider is not available.')
  }

  return {
    customer: {
      email: email.toLowerCase(),
      name: readText(value.customer.name, 'Customer name', 120)!,
      phone: readText(value.customer.phone, 'Phone', 40, true),
    },
    deliveryMethod: value.deliveryMethod as CheckoutInput['deliveryMethod'],
    idempotencyKey,
    paymentProvider: 'manual',
    promoCode: readText(value.promoCode, 'Promo code', 50, true)?.toUpperCase(),
    shippingAddress: parseAddress(value.shippingAddress),
  }
}

export { CheckoutValidationError, parseCheckoutInput }
