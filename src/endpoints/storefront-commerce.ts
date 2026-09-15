import { hasRole } from '@/access'
import { resolveCart } from '@/libs/cart-resolver'
import {
  CART_COOKIE_NAME,
  CartSessionError,
  clearCartCookie,
  createCartCookie,
  decodeCartSession,
  getCookieValue,
  normalizeCartItems,
} from '@/libs/cart-session'
import { calculateOrderTotals } from '@/libs/commerce-calculations'
import { CheckoutError, checkout, getPromotionRule, resolvePromotion } from '@/libs/checkout'
import {
  CheckoutValidationError,
  parseCheckoutInput,
  parsePromotionCodeInput,
} from '@/libs/checkout-validation'
import type { StoreSetting } from '@/payload-types'
import { headersWithCors, type Endpoint, type PayloadRequest } from 'payload'

const responseHeaders = (req: PayloadRequest, cookie?: string) =>
  headersWithCors({
    headers: new Headers({
      'Cache-Control': 'private, no-store',
      ...(cookie ? { 'Set-Cookie': cookie } : {}),
    }),
    req,
  })

const assertSameOrigin = (req: PayloadRequest) => {
  const origin = req.headers.get('origin')
  if (origin && origin !== new URL(req.url ?? 'http://localhost').origin) {
    throw new CheckoutValidationError('Cross-origin commerce request rejected.', 403)
  }
}

const readJson = async (req: PayloadRequest) => {
  if (!req.json) throw new CheckoutValidationError('JSON request body is required.')
  return req.json()
}

const getCartItems = (req: PayloadRequest) =>
  decodeCartSession(
    getCookieValue(req.headers.get('cookie'), CART_COOKIE_NAME),
    req.payload.config.secret,
  )

const getCartSessionMinutes = async (req: PayloadRequest) => {
  const settings = (await req.payload.findGlobal({
    depth: 0,
    overrideAccess: true,
    req,
    select: { cartSessionMinutes: true },
    slug: 'store-settings',
  })) as StoreSetting

  return settings.cartSessionMinutes
}

const toErrorResponse = (req: PayloadRequest, error: unknown) => {
  if (
    error instanceof CartSessionError ||
    error instanceof CheckoutError ||
    error instanceof CheckoutValidationError
  ) {
    const status = 'status' in error ? error.status : 400
    const code = error instanceof CheckoutError ? error.code : 'invalidRequest'
    return Response.json(
      { error: { code, message: error.message } },
      { headers: responseHeaders(req), status },
    )
  }

  req.payload.logger.error({ err: error, msg: 'Storefront commerce endpoint failed.' })
  return Response.json(
    { error: { code: 'internalError', message: 'Unable to process the request.' } },
    { headers: responseHeaders(req), status: 500 },
  )
}

const getCartEndpoint: Endpoint = {
  handler: async (req) => {
    const cart = await resolveCart(req.payload, getCartItems(req), req)
    return Response.json(cart, { headers: responseHeaders(req) })
  },
  method: 'get',
  path: '/storefront/cart',
}

const updateCartEndpoint: Endpoint = {
  handler: async (req) => {
    try {
      assertSameOrigin(req)
      const body = (await readJson(req)) as { items?: unknown }
      const items = normalizeCartItems(body.items)
      const [cart, durationMinutes] = await Promise.all([
        resolveCart(req.payload, items, req),
        getCartSessionMinutes(req),
      ])
      const cookie = createCartCookie(items, req.payload.config.secret, durationMinutes)

      return Response.json(cart, { headers: responseHeaders(req, cookie) })
    } catch (error) {
      return toErrorResponse(req, error)
    }
  },
  method: 'put',
  path: '/storefront/cart',
}

const clearCartEndpoint: Endpoint = {
  handler: async (req) => {
    try {
      assertSameOrigin(req)
      return Response.json(
        { issues: [], items: [], subtotal: 0 },
        { headers: responseHeaders(req, clearCartCookie()) },
      )
    } catch (error) {
      return toErrorResponse(req, error)
    }
  },
  method: 'delete',
  path: '/storefront/cart',
}

const applyCartPromotionEndpoint: Endpoint = {
  handler: async (req) => {
    try {
      assertSameOrigin(req)
      const code = parsePromotionCodeInput(await readJson(req))
      const cart = await resolveCart(req.payload, getCartItems(req), req)
      if (cart.items.length === 0) throw new CheckoutError('emptyCart', 'Cart is empty.')
      if (cart.issues.length > 0) {
        throw new CheckoutError('invalidCart', 'Cart contains unavailable items.')
      }

      const calculationItems = cart.items.map((item) => ({
        categoryId: item.categoryId,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price,
      }))
      const [promotion, settings] = await Promise.all([
        resolvePromotion(req, code, calculationItems),
        req.payload.findGlobal({
          depth: 0,
          overrideAccess: true,
          req,
          select: {
            defaultDeliveryFee: true,
            freeShippingThreshold: true,
          },
          slug: 'store-settings',
        }) as Promise<StoreSetting>,
      ])
      if (!promotion) throw new CheckoutError('invalidPromo', 'Promotion code is invalid.')

      const totals = calculateOrderTotals({
        delivery: {
          baseFee: settings.defaultDeliveryFee,
          freeDeliveryThreshold: settings.freeShippingThreshold,
        },
        items: calculationItems,
        promotion: getPromotionRule(promotion),
        taxRate: 0,
      })

      return Response.json(
        {
          promotion: {
            code: promotion.code,
            type: promotion.type,
            value: promotion.value,
          },
          totals,
        },
        { headers: responseHeaders(req) },
      )
    } catch (error) {
      return toErrorResponse(req, error)
    }
  },
  method: 'post',
  path: '/storefront/cart/promotion',
}

const checkoutEndpoint: Endpoint = {
  handler: async (req) => {
    try {
      assertSameOrigin(req)
      if (req.user && !hasRole(req.user, ['customer'])) {
        throw new CheckoutValidationError(
          'Only customer accounts can use storefront checkout.',
          403,
        )
      }

      const input = parseCheckoutInput(await readJson(req))
      const result = await checkout(req, getCartItems(req), input)
      return Response.json(result, {
        headers: responseHeaders(req, clearCartCookie()),
        status: result.idempotentReplay ? 200 : 201,
      })
    } catch (error) {
      return toErrorResponse(req, error)
    }
  },
  method: 'post',
  path: '/storefront/checkout',
}

const storefrontCommerceEndpoints = [
  getCartEndpoint,
  updateCartEndpoint,
  clearCartEndpoint,
  applyCartPromotionEndpoint,
  checkoutEndpoint,
]

export { storefrontCommerceEndpoints }
