'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import { calculateDeliveryFee, roundMoney } from '@/libs/commerce-calculations'
import type { CartPricingConfig, CartPromotionResult } from '@/types/cart'

type Props = {
  hasItems: boolean
  pricing: CartPricingConfig
  subtotal: number
}

const OrderSummary = ({ hasItems, pricing, subtotal }: Props) => {
  const [appliedPromotion, setAppliedPromotion] = useState<CartPromotionResult>()
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const deliveryFee = calculateDeliveryFee(subtotal, {
    baseFee: pricing.baseDeliveryFee,
    freeDeliveryThreshold: pricing.freeDeliveryThreshold,
  })
  const totals = appliedPromotion?.totals ?? {
    deliveryFee,
    discount: 0,
    subtotal,
    tax: 0,
    total: roundMoney(subtotal + deliveryFee),
  }
  const discountLabel =
    appliedPromotion?.promotion.type === 'percentage'
      ? `Discount (-${appliedPromotion.promotion.value}%)`
      : 'Discount'
  const checkoutHref = appliedPromotion
    ? `/checkout?promoCode=${encodeURIComponent(appliedPromotion.promotion.code)}`
    : '/checkout'

  return (
    <aside className="rounded-[20px] border border-black/10 p-5 md:p-6">
      <h2 className="text-xl font-bold md:text-2xl">Order Summary</h2>
      <dl className="mt-5 space-y-5 text-base md:text-xl">
        <div className="flex justify-between">
          <dt className="text-muted">Subtotal</dt>
          <dd className="font-bold">${totals.subtotal}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">{discountLabel}</dt>
          <dd className="font-bold text-sale-text">-${totals.discount}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Delivery Fee</dt>
          <dd className="font-bold">${totals.deliveryFee}</dd>
        </div>
        <div className="border-t border-black/10 pt-5">
          <div className="flex justify-between">
            <dt>Total</dt>
            <dd className="text-xl font-bold md:text-2xl">${totals.total}</dd>
          </div>
        </div>
      </dl>
      <form
        className="mt-5 flex gap-3"
        onSubmit={async (event) => {
          event.preventDefault()
          setAppliedPromotion(undefined)
          setError('')
          setPending(true)
          const form = new FormData(event.currentTarget)

          try {
            const response = await fetch('/api/storefront/cart/promotion', {
              body: JSON.stringify({ code: form.get('promoCode') }),
              headers: { 'Content-Type': 'application/json' },
              method: 'POST',
            })
            const result = (await response.json()) as CartPromotionResult & {
              error?: { message?: string }
            }
            if (!response.ok) {
              throw new Error(result.error?.message || 'Unable to apply promotion code.')
            }
            setAppliedPromotion(result)
          } catch (cause) {
            setError(cause instanceof Error ? cause.message : 'Unable to apply promotion code.')
          } finally {
            setPending(false)
          }
        }}
      >
        <label className="flex h-12 min-w-0 flex-1 items-center gap-3 rounded-full bg-surface px-4 md:h-13">
          <Image alt="" height={20} src="/images/figma/promo-tag.svg" width={20} />
          <span className="sr-only">Promo code</span>
          <input
            aria-label="Promo code"
            className="min-w-0 flex-1 bg-transparent text-sm uppercase outline-none placeholder:normal-case placeholder:text-muted"
            disabled={!hasItems || pending}
            maxLength={50}
            name="promoCode"
            placeholder="Add promo code"
            required
          />
        </label>
        <button
          className="h-12 rounded-full bg-ink px-6 font-medium text-white disabled:bg-black/30 md:h-13 md:px-8"
          disabled={!hasItems || pending}
          type="submit"
        >
          {pending ? 'Applying…' : 'Apply'}
        </button>
      </form>
      {(error || appliedPromotion) && (
        <p
          className={`mt-3 text-sm ${error ? 'text-sale-text' : 'text-green-700'}`}
          role={error ? 'alert' : 'status'}
        >
          {error || `Promo code ${appliedPromotion?.promotion.code} applied.`}
        </p>
      )}
      <Link
        aria-disabled={!hasItems}
        className={`mt-5 flex h-13.5 w-full items-center justify-center gap-3 rounded-full font-medium text-white ${hasItems ? 'bg-ink' : 'pointer-events-none bg-black/30'}`}
        href={checkoutHref}
      >
        Go to Checkout
        <Image alt="" height={20} src="/images/figma/checkout-arrow.svg" width={20} />
      </Link>
    </aside>
  )
}

export { OrderSummary }
