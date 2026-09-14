import type { Order, Product, Promotion, StoreSetting, User } from '@/payload-types'
import { resolveCartContext } from '@/libs/cart-resolver'
import {
  calculateOrderTotals,
  getPromotionEligibility,
  normalizePromotionCode,
} from '@/libs/commerce-calculations'
import type { CartSessionItem, CheckoutInput, CheckoutResult, ResolvedCartItem } from '@/types/cart'
import type { CalculationLine, PromotionRule } from '@/types/commerce'
import type { Payload, PayloadRequest, RequiredDataFromCollectionSlug } from 'payload'

type RelationshipValue = { id: number } | number

class CheckoutError extends Error {
  code: string
  status: number

  constructor(code: string, message: string, status = 400) {
    super(message)
    this.code = code
    this.name = 'CheckoutError'
    this.status = status
  }
}

const getRelationshipId = (value: null | RelationshipValue | undefined) =>
  value && typeof value === 'object' ? value.id : value

const getRelationshipIds = (values: null | RelationshipValue[] | undefined) =>
  values?.map(getRelationshipId).filter((id): id is number => id != null) ?? []

const mapOrderResult = (order: Order, idempotentReplay: boolean): CheckoutResult => ({
  idempotentReplay,
  order: {
    id: order.id,
    orderNumber: order.orderNumber ?? null,
    totals: {
      deliveryFee: order.deliveryFee,
      discount: order.discount,
      subtotal: order.subtotal,
      tax: order.tax,
      total: order.total,
    },
  },
})

const findOrderByIdempotencyKey = async (
  payload: Payload,
  idempotencyKey: string,
  req?: PayloadRequest,
) => {
  const result = await payload.find({
    collection: 'orders',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    req,
    select: {
      customerEmail: true,
      deliveryFee: true,
      discount: true,
      orderNumber: true,
      subtotal: true,
      tax: true,
      total: true,
    },
    where: { idempotencyKey: { equals: idempotencyKey } },
  })

  return result.docs[0] as Order | undefined
}

const getCheckoutCustomer = (req: PayloadRequest, input: CheckoutInput) => {
  const user = req.user as null | User
  const isCustomer = user?.roles?.includes('customer') === true

  return {
    email: isCustomer ? user.email.toLowerCase() : input.customer.email,
    id: isCustomer ? user.id : undefined,
    name: isCustomer ? user.name : input.customer.name,
  }
}

const assertReplayOwnership = (order: Order, customerEmail: string) => {
  if (order.customerEmail.toLowerCase() !== customerEmail) {
    throw new CheckoutError(
      'idempotencyConflict',
      'Idempotency key is already associated with another checkout.',
      409,
    )
  }
}

const getPromotionRule = (promotion: Promotion): PromotionRule => ({
  appliesTo: promotion.appliesTo,
  categoryIds: getRelationshipIds(promotion.categories as RelationshipValue[] | undefined),
  endsAt: promotion.endsAt,
  isActive: promotion.isActive,
  maximumDiscount: promotion.maximumDiscount,
  minimumSubtotal: promotion.minimumSubtotal,
  productIds: getRelationshipIds(promotion.products as RelationshipValue[] | undefined),
  startsAt: promotion.startsAt,
  type: promotion.type,
  usageLimit: promotion.usageLimit,
  usedCount: promotion.usedCount,
  value: promotion.value,
})

const resolvePromotion = async (
  req: PayloadRequest,
  promoCode: string | undefined,
  calculationItems: CalculationLine[],
  customerEmail: string,
) => {
  if (!promoCode) return undefined

  const result = await req.payload.find({
    collection: 'promotions',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    req,
    where: { code: { equals: normalizePromotionCode(promoCode) } },
  })
  const promotion = result.docs[0] as Promotion | undefined
  if (!promotion) throw new CheckoutError('invalidPromo', 'Promotion code is invalid.')

  const eligibility = getPromotionEligibility(getPromotionRule(promotion), calculationItems)
  if (!eligibility.eligible) {
    throw new CheckoutError(
      'invalidPromo',
      `Promotion cannot be applied: ${eligibility.reason ?? 'ineligible'}.`,
    )
  }

  if (promotion.usageLimitPerCustomer != null) {
    const usage = await req.payload.count({
      collection: 'orders',
      overrideAccess: true,
      req,
      where: {
        and: [
          { promotion: { equals: promotion.id } },
          { customerEmail: { equals: customerEmail } },
        ],
      },
    })
    if (usage.totalDocs >= promotion.usageLimitPerCustomer) {
      throw new CheckoutError('invalidPromo', 'Promotion usage limit reached for this customer.')
    }
  }

  return promotion
}

const getDeliveryFee = (settings: StoreSetting, method: CheckoutInput['deliveryMethod']) => {
  if (method === 'pickup') return 0
  return method === 'express' ? settings.defaultDeliveryFee * 2 : settings.defaultDeliveryFee
}

const deductInventory = async (
  req: PayloadRequest,
  products: Map<number, Product>,
  items: ResolvedCartItem[],
) => {
  const itemsByProduct = new Map<number, ResolvedCartItem[]>()
  for (const item of items) {
    itemsByProduct.set(item.productId, [...(itemsByProduct.get(item.productId) ?? []), item])
  }

  for (const [productId, productItems] of itemsByProduct) {
    const product = products.get(productId)
    if (!product?.trackInventory) continue

    const variants = product.variants ?? []
    if (variants.length > 0) {
      const nextVariants = variants.map((variant) => {
        const quantity = productItems
          .filter(({ variantId }) => variantId === variant.id || variantId === variant.sku)
          .reduce((total, item) => total + item.quantity, 0)
        if (quantity === 0) return variant
        if (variant.stock < quantity) {
          throw new CheckoutError('insufficientStock', `Insufficient stock for ${product.name}.`, 409)
        }

        return { ...variant, stock: variant.stock - quantity }
      })

      await req.payload.update({
        collection: 'products',
        id: product.id,
        data: { variants: nextVariants },
        draft: false,
        overrideAccess: true,
        req,
      })
      continue
    }

    const quantity = productItems.reduce((total, item) => total + item.quantity, 0)
    const stock = product.stock ?? 0
    if (stock < quantity) {
      throw new CheckoutError('insufficientStock', `Insufficient stock for ${product.name}.`, 409)
    }
    await req.payload.update({
      collection: 'products',
      id: product.id,
      data: { stock: stock - quantity },
      draft: false,
      overrideAccess: true,
      req,
    })
  }
}

const checkout = async (
  req: PayloadRequest,
  cartItems: CartSessionItem[],
  input: CheckoutInput,
): Promise<CheckoutResult> => {
  const checkoutCustomer = getCheckoutCustomer(req, input)
  const replay = await findOrderByIdempotencyKey(req.payload, input.idempotencyKey)
  if (replay) {
    assertReplayOwnership(replay, checkoutCustomer.email)
    return mapOrderResult(replay, true)
  }
  if (cartItems.length === 0) throw new CheckoutError('emptyCart', 'Cart is empty.')

  const transactionID = await req.payload.db.beginTransaction({
    accessMode: 'read write',
    isolationLevel: 'serializable',
  })
  if (!transactionID) {
    throw new CheckoutError('transactionUnavailable', 'Checkout transaction is unavailable.', 503)
  }
  req.transactionID = transactionID

  try {
    const replayInTransaction = await findOrderByIdempotencyKey(
      req.payload,
      input.idempotencyKey,
      req,
    )
    if (replayInTransaction) {
      assertReplayOwnership(replayInTransaction, checkoutCustomer.email)
      await req.payload.db.commitTransaction(transactionID)
      delete req.transactionID
      return mapOrderResult(replayInTransaction, true)
    }

    const { cart, products } = await resolveCartContext(req.payload, cartItems, req)
    const settings = (await req.payload.findGlobal({
      depth: 0,
      overrideAccess: true,
      req,
      select: {
        defaultDeliveryFee: true,
        freeShippingThreshold: true,
        pricesIncludeTax: true,
        taxRate: true,
      },
      slug: 'store-settings',
    })) as StoreSetting
    if (cart.issues.length > 0 || cart.items.length !== cartItems.length) {
      const issue = cart.issues[0]
      throw new CheckoutError(
        issue?.code ?? 'invalidCart',
        issue?.message ?? 'Cart contains unavailable items.',
        issue?.code === 'insufficientStock' ? 409 : 400,
      )
    }

    const calculationItems: CalculationLine[] = cart.items.map((item) => ({
      categoryId: item.categoryId,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.price,
    }))
    const promotion = await resolvePromotion(
      req,
      input.promoCode,
      calculationItems,
      checkoutCustomer.email,
    )
    const totals = calculateOrderTotals({
      delivery: {
        baseFee: getDeliveryFee(settings, input.deliveryMethod),
        freeDeliveryThreshold: settings.freeShippingThreshold,
      },
      items: calculationItems,
      promotion: promotion ? getPromotionRule(promotion) : undefined,
      taxRate: settings.pricesIncludeTax ? 0 : settings.taxRate,
    })

    await deductInventory(req, products, cart.items)

    const orderData: RequiredDataFromCollectionSlug<'orders'> = {
      billingSameAsShipping: true,
      customer: checkoutCustomer.id,
      customerEmail: checkoutCustomer.email,
      customerName: checkoutCustomer.name,
      customerPhone: input.customer.phone,
      deliveryFee: totals.deliveryFee,
      deliveryMethod: input.deliveryMethod,
      discount: totals.discount,
      fulfillmentStatus: 'unfulfilled',
      idempotencyKey: input.idempotencyKey,
      items: cart.items.map((item) => ({
        categoryId: item.categoryId == null ? undefined : String(item.categoryId),
        lineTotal: item.lineTotal,
        product: item.productId,
        productName: item.name,
        productSnapshotId: String(item.productId),
        quantity: item.quantity,
        sku: item.sku,
        unitPrice: item.price,
        variant: {
          color: item.color ?? undefined,
          id: item.variantId ?? undefined,
          size: item.size ?? undefined,
        },
      })),
      paymentProvider: input.paymentProvider,
      paymentStatus: 'pending',
      promotion: promotion?.id,
      shippingAddress: input.shippingAddress,
      subtotal: totals.subtotal,
      tax: totals.tax,
      taxRate: settings.pricesIncludeTax ? 0 : settings.taxRate,
      timeline: [
        {
          message: 'Order created from storefront checkout.',
          occurredAt: new Date().toISOString(),
          status: 'created',
        },
      ],
      total: totals.total,
    }
    const order = await req.payload.create({
      collection: 'orders',
      data: orderData,
      overrideAccess: true,
      req,
    })

    if (promotion) {
      await req.payload.update({
        collection: 'promotions',
        id: promotion.id,
        data: { usedCount: promotion.usedCount + 1 },
        overrideAccess: true,
        req,
      })
    }

    await req.payload.db.commitTransaction(transactionID)
    delete req.transactionID
    return mapOrderResult(order, false)
  } catch (error) {
    if (req.payload.db.sessions?.[String(transactionID)]) {
      await req.payload.db.rollbackTransaction(transactionID)
    }
    delete req.transactionID

    const duplicate = await findOrderByIdempotencyKey(req.payload, input.idempotencyKey)
    if (duplicate) {
      assertReplayOwnership(duplicate, checkoutCustomer.email)
      return mapOrderResult(duplicate, true)
    }
    throw error
  }
}

export { CheckoutError, checkout, findOrderByIdempotencyKey }
