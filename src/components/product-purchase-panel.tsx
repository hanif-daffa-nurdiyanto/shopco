'use client'

import Image from 'next/image'
import { useState } from 'react'

import { dispatchCartUpdated } from '@/libs/cart-events'
import type { CartSessionItem, ResolvedCart } from '@/types/cart'
import type { ProductDetail, ProductVariantOption } from '@/types/product-detail'

const ProductPurchasePanel = ({ product }: { product: ProductDetail }) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantOption | undefined>(
    product.variants?.find(({ active, stock }) => active && stock > 0),
  )
  const [quantity, setQuantity] = useState(1)
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)
  const price = selectedVariant?.price ?? product.price
  const selectVariant = (predicate: (variant: ProductVariantOption) => boolean) => {
    const variant = product.variants?.find(
      (candidate) => predicate(candidate) && candidate.active && candidate.stock > 0,
    )
    if (variant) {
      setSelectedVariant(variant)
      setQuantity(1)
    }
  }

  return (
    <div>
      <h1 className="font-display text-[24px] leading-7 font-bold uppercase md:text-[40px] md:leading-none">
        {product.name}
      </h1>
      <div className="mt-3 flex items-center gap-3">
        <span className="tracking-[2px] text-star">★★★★★</span>
        <span className="text-sm">
          {product.rating}
          <span className="text-muted">/5</span>
        </span>
      </div>
      <div className="mt-3 flex items-center gap-3 text-2xl font-bold md:text-[32px]">
        <span>${price}</span>
        {product.originalPrice != null && (
          <span className="text-black/30 line-through">${product.originalPrice}</span>
        )}
        {product.discount != null && (
          <span className="rounded-full bg-sale px-3.5 py-1.5 text-sm font-medium text-sale-text">
            -{product.discount}%
          </span>
        )}
      </div>
      <p className="mt-5 text-sm leading-5 text-muted md:text-base md:leading-5.5">
        {product.description}
      </p>
      <div className="my-6 border-t border-black/10" />
      <fieldset>
        <legend className="text-muted">Select Colors</legend>
        <div className="mt-4 flex gap-4">
          {[
            ...new Map(product.variants?.map((variant) => [variant.colorHex, variant])).values(),
          ].map((variant) => (
            <button
              aria-label={`Select color ${variant.colorName}`}
              className="flex size-9 items-center justify-center rounded-full border border-black/10"
              key={variant.colorHex}
              onClick={() => selectVariant((candidate) => candidate.colorHex === variant.colorHex)}
              style={{ backgroundColor: variant.colorHex }}
              type="button"
            >
              {selectedVariant?.colorHex === variant.colorHex && (
                <span
                  className={`text-lg ${['#FFF', '#FFFFFF'].includes(variant.colorHex.toUpperCase()) ? 'text-ink' : 'text-white'}`}
                >
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="my-6 border-t border-black/10" />
      <fieldset>
        <legend className="text-muted">Choose Size</legend>
        <div className="mt-4 flex flex-wrap gap-3">
          {[...new Set(product.variants?.map(({ size }) => size))].map((item) => (
            <button
              className={`rounded-full px-5 py-3 text-sm md:px-6 md:text-base ${selectedVariant?.size === item ? 'bg-ink text-white' : 'bg-surface text-muted'}`}
              key={item}
              onClick={() => selectVariant((candidate) => candidate.size === item)}
            >
              {item}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="my-6 border-t border-black/10" />
      <div className="flex gap-3 md:gap-5">
        <div className="flex h-13 w-27.5 items-center justify-between rounded-full bg-surface px-4 md:w-42.5 md:px-5">
          <button
            aria-label="Decrease quantity"
            disabled={quantity === 1}
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
          >
            <Image alt="" height={20} src="/images/figma/minus.svg" width={20} />
          </button>
          <span>{quantity}</span>
          <button
            aria-label="Increase quantity"
            disabled={selectedVariant != null && quantity >= selectedVariant.stock}
            onClick={() => setQuantity((value) => value + 1)}
          >
            <Image alt="" height={20} src="/images/figma/plus.svg" width={20} />
          </button>
        </div>
        <button
          className="h-13 flex-1 rounded-full bg-ink font-medium text-white disabled:bg-black/30"
          disabled={pending || !selectedVariant || !Number.isInteger(Number(product.id))}
          onClick={async () => {
            if (!selectedVariant) return
            setPending(true)
            setMessage('')
            try {
              const currentResponse = await fetch('/api/storefront/cart')
              const current = (await currentResponse.json()) as ResolvedCart
              const items: CartSessionItem[] = current.items.map(
                ({ productId, quantity: currentQuantity, variantId }) => ({
                  productId,
                  quantity: currentQuantity,
                  variantId,
                }),
              )
              const existing = items.find(
                (item) =>
                  item.productId === Number(product.id) && item.variantId === selectedVariant.id,
              )
              if (existing) existing.quantity += quantity
              else
                items.push({
                  productId: Number(product.id),
                  quantity,
                  variantId: selectedVariant.id,
                })

              const response = await fetch('/api/storefront/cart', {
                body: JSON.stringify({ items }),
                headers: { 'Content-Type': 'application/json' },
                method: 'PUT',
              })
              const result = (await response.json()) as ResolvedCart & {
                error?: { message?: string }
              }
              if (!response.ok) throw new Error(result.error?.message || 'Unable to add item.')
              dispatchCartUpdated(result)
              setMessage('Added to cart.')
            } catch (cause) {
              setMessage(cause instanceof Error ? cause.message : 'Unable to add item.')
            } finally {
              setPending(false)
            }
          }}
        >
          {pending ? 'Adding…' : 'Add to Cart'}
        </button>
      </div>
      {message && (
        <p className="mt-3 text-sm text-muted" role="status">
          {message}
        </p>
      )}
    </div>
  )
}

export { ProductPurchasePanel }
