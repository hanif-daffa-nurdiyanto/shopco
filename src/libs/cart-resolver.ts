import type { Media, Product } from '@/payload-types'
import { calculateSubtotal, roundMoney } from '@/libs/commerce-calculations'
import type { CartIssue, CartSessionItem, ResolvedCart, ResolvedCartItem } from '@/types/cart'
import type { Payload, PayloadRequest } from 'payload'

type ResolvedCartContext = {
  cart: ResolvedCart
  products: Map<number, Product>
}

const getRelationshipId = (value: { id: number } | number) =>
  typeof value === 'object' ? value.id : value

const getImageUrl = (value: Media | number) =>
  typeof value === 'object'
    ? value.sizes?.productCard?.url || value.url || '/images/figma/hero.png'
    : '/images/figma/hero.png'

const getItemKey = ({ productId, variantId }: CartSessionItem) =>
  `${productId}:${variantId ?? 'default'}`

const resolveCartContext = async (
  payload: Payload,
  items: CartSessionItem[],
  req?: PayloadRequest,
): Promise<ResolvedCartContext> => {
  if (items.length === 0) {
    return { cart: { issues: [], items: [], subtotal: 0 }, products: new Map() }
  }

  const productIds = [...new Set(items.map(({ productId }) => productId))]
  const result = await payload.find({
    collection: 'products',
    depth: 1,
    draft: false,
    limit: productIds.length,
    overrideAccess: false,
    pagination: false,
    req,
    select: {
      category: true,
      featuredImage: true,
      name: true,
      price: true,
      sku: true,
      stock: true,
      trackInventory: true,
      variants: true,
    },
    where: {
      and: [
        { id: { in: productIds } },
        { visibility: { equals: 'catalog' } },
        { _status: { equals: 'published' } },
      ],
    },
  })
  const products = new Map(result.docs.map((product) => [product.id, product as Product]))
  const issues: CartIssue[] = []
  const resolvedItems: ResolvedCartItem[] = []

  for (const item of items) {
    const product = products.get(item.productId)
    if (!product) {
      issues.push({
        code: 'productUnavailable',
        message: `Product ${item.productId} is not available.`,
        productId: item.productId,
        variantId: item.variantId,
      })
      continue
    }

    const variants = product.variants ?? []
    if (variants.length > 0 && !item.variantId) {
      issues.push({
        code: 'variantRequired',
        message: `${product.name} requires a variant selection.`,
        productId: item.productId,
        variantId: item.variantId,
      })
      continue
    }

    const variant = variants.find(({ id, sku }) => id === item.variantId || sku === item.variantId)
    if (variants.length > 0 && !variant) {
      issues.push({
        code: 'variantUnavailable',
        message: `The selected variant for ${product.name} is not available.`,
        productId: item.productId,
        variantId: item.variantId,
      })
      continue
    }

    const availableStock = product.trackInventory
      ? variant?.stock ?? product.stock ?? 0
      : null
    const active = variant?.isActive !== false
    const hasStock = availableStock == null || availableStock >= item.quantity
    const price = variant?.priceOverride ?? product.price
    const resolvedItem: ResolvedCartItem = {
      ...item,
      available: active && hasStock,
      availableStock,
      categoryId: getRelationshipId(product.category),
      color: variant?.color.name ?? null,
      image: getImageUrl(product.featuredImage),
      key: getItemKey(item),
      lineTotal: roundMoney(price * item.quantity),
      name: product.name,
      price,
      size: variant?.size ?? null,
      sku: variant?.sku ?? product.sku,
    }
    resolvedItems.push(resolvedItem)

    if (!active) {
      issues.push({
        code: 'inactiveVariant',
        message: `The selected variant for ${product.name} is inactive.`,
        productId: item.productId,
        variantId: item.variantId,
      })
    } else if (!hasStock) {
      issues.push({
        code: 'insufficientStock',
        message: `${product.name} only has ${availableStock} item(s) available.`,
        productId: item.productId,
        variantId: item.variantId,
      })
    }
  }

  return {
    cart: {
      issues,
      items: resolvedItems,
      subtotal: calculateSubtotal(
        resolvedItems.map(({ productId, quantity, price }) => ({
          productId,
          quantity,
          unitPrice: price,
        })),
      ),
    },
    products,
  }
}

const resolveCart = async (
  payload: Payload,
  items: CartSessionItem[],
  req?: PayloadRequest,
) => (await resolveCartContext(payload, items, req)).cart

export { getItemKey, resolveCart, resolveCartContext }
export type { ResolvedCartContext }
