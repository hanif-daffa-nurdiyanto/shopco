'use client'

import { useState } from 'react'

import { dispatchCartUpdated } from '@/libs/cart-events'
import type { CartPricingConfig, CartSessionItem, ResolvedCart } from '@/types/cart'

import { CartItem } from './cart-item'
import { OrderSummary } from './order-summary'

type Props = {
  initialCart: ResolvedCart
  pricing: CartPricingConfig
}

const CartContent = ({ initialCart, pricing }: Props) => {
  const [cart, setCart] = useState(initialCart)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const updateCart = async (items: CartSessionItem[]) => {
    setPending(true)
    setError('')
    try {
      const response = await fetch('/api/storefront/cart', {
        body: JSON.stringify({ items }),
        headers: { 'Content-Type': 'application/json' },
        method: 'PUT',
      })
      const result = (await response.json()) as ResolvedCart & {
        error?: { message?: string }
      }
      if (!response.ok) throw new Error(result.error?.message || 'Unable to update cart.')
      setCart(result)
      dispatchCartUpdated(result)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to update cart.')
    } finally {
      setPending(false)
    }
  }
  const changeQuantity = (key: string, quantity: number) =>
    updateCart(
      cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.key === key ? Math.max(1, quantity) : item.quantity,
        variantId: item.variantId,
      })),
    )
  const removeItem = (key: string) =>
    updateCart(
      cart.items
        .filter((item) => item.key !== key)
        .map(({ productId, quantity, variantId }) => ({ productId, quantity, variantId })),
    )

  return (
    <section className="mt-5 grid items-start gap-5 md:mt-6 md:grid-cols-[1.4fr_1fr]">
      <div className="divide-y divide-black/10 rounded-[20px] border border-black/10 px-3.5 py-3.5 md:px-6 md:py-5">
        {cart.items.length > 0 ? (
          cart.items.map((item) => (
            <CartItem
              item={item}
              key={item.key}
              onChangeQuantity={changeQuantity}
              onRemove={removeItem}
              pending={pending}
            />
          ))
        ) : (
          <p className="py-16 text-center text-muted">Your cart is empty.</p>
        )}
      </div>
      <OrderSummary
        hasItems={cart.items.length > 0}
        key={cart.items.map(({ key, quantity }) => `${key}:${quantity}`).join('|')}
        pricing={pricing}
        subtotal={cart.subtotal}
      />
      {(error || cart.issues.length > 0) && (
        <div className="md:col-span-2" role="alert">
          {error && <p className="text-sm text-sale-text">{error}</p>}
          {cart.issues.map((issue) => (
            <p className="text-sm text-sale-text" key={`${issue.code}-${issue.productId}`}>
              {issue.message}
            </p>
          ))}
        </div>
      )}
    </section>
  )
}

export { CartContent }
