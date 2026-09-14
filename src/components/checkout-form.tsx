'use client'

import { useRef, useState } from 'react'

import type { CheckoutResult, ResolvedCart } from '@/types/cart'

const inputClassName =
  'h-12 w-full rounded-xl border border-black/10 px-4 text-sm outline-none focus:border-black/40'

const CheckoutForm = ({ cart }: { cart: ResolvedCart }) => {
  const idempotencyKey = useRef('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<CheckoutResult>()

  if (result) {
    return (
      <section className="mt-8 rounded-[20px] border border-black/10 p-8 text-center">
        <h1 className="font-display text-3xl font-bold uppercase">Order received</h1>
        <p className="mt-3 text-muted">Order number: {result.order.orderNumber}</p>
        <p className="mt-2 text-xl font-bold">Total: ${result.order.totals.total}</p>
      </section>
    )
  }

  return (
    <form
      className="mt-8 grid items-start gap-6 md:grid-cols-[1.4fr_0.8fr]"
      onSubmit={async (event) => {
        event.preventDefault()
        setPending(true)
        setError('')
        const form = new FormData(event.currentTarget)
        idempotencyKey.current ||= crypto.randomUUID()

        try {
          const response = await fetch('/api/storefront/checkout', {
            body: JSON.stringify({
              customer: {
                email: form.get('email'),
                name: form.get('name'),
                phone: form.get('phone'),
              },
              deliveryMethod: form.get('deliveryMethod'),
              idempotencyKey: idempotencyKey.current,
              paymentProvider: 'manual',
              promoCode: form.get('promoCode'),
              shippingAddress: {
                city: form.get('city'),
                country: form.get('country'),
                line1: form.get('line1'),
                line2: form.get('line2'),
                postalCode: form.get('postalCode'),
                province: form.get('province'),
                recipientName: form.get('recipientName'),
              },
            }),
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
          })
          const payload = (await response.json()) as CheckoutResult & {
            error?: { message?: string }
          }
          if (!response.ok) throw new Error(payload.error?.message || 'Checkout failed.')
          setResult(payload)
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : 'Checkout failed.')
        } finally {
          setPending(false)
        }
      }}
    >
      <div className="space-y-5 rounded-[20px] border border-black/10 p-5 md:p-6">
        <h1 className="font-display text-3xl font-bold uppercase">Shipping details</h1>
        <div className="grid gap-4 md:grid-cols-2">
          <input className={inputClassName} name="name" placeholder="Full name" required />
          <input className={inputClassName} name="email" placeholder="Email" required type="email" />
          <input className={inputClassName} name="phone" placeholder="Phone (optional)" />
          <input
            className={inputClassName}
            name="recipientName"
            placeholder="Recipient name"
            required
          />
          <input
            className={`${inputClassName} md:col-span-2`}
            name="line1"
            placeholder="Address"
            required
          />
          <input
            className={`${inputClassName} md:col-span-2`}
            name="line2"
            placeholder="Address line 2 (optional)"
          />
          <input className={inputClassName} name="city" placeholder="City" required />
          <input className={inputClassName} name="province" placeholder="Province" required />
          <input className={inputClassName} name="postalCode" placeholder="Postal code" required />
          <input
            className={inputClassName}
            defaultValue="Indonesia"
            name="country"
            placeholder="Country"
            required
          />
        </div>
      </div>
      <aside className="rounded-[20px] border border-black/10 p-5 md:p-6">
        <h2 className="text-2xl font-bold">Order Summary</h2>
        <div className="mt-5 space-y-3">
          {cart.items.map((item) => (
            <div className="flex justify-between gap-4 text-sm" key={item.key}>
              <span>{item.name} × {item.quantity}</span>
              <strong>${item.lineTotal}</strong>
            </div>
          ))}
          <div className="flex justify-between border-t border-black/10 pt-4 text-xl">
            <span>Subtotal</span>
            <strong>${cart.subtotal}</strong>
          </div>
        </div>
        <input className={`${inputClassName} mt-5`} name="promoCode" placeholder="Promo code" />
        <select className={`${inputClassName} mt-3`} name="deliveryMethod" defaultValue="standard">
          <option value="standard">Standard delivery</option>
          <option value="express">Express delivery</option>
          <option value="pickup">Pickup</option>
        </select>
        {error && <p className="mt-3 text-sm text-sale-text" role="alert">{error}</p>}
        <button
          className="mt-5 h-13.5 w-full rounded-full bg-ink font-medium text-white disabled:bg-black/30"
          disabled={pending}
          type="submit"
        >
          {pending ? 'Processing…' : 'Place order'}
        </button>
        <p className="mt-3 text-xs leading-5 text-muted">
          Final prices, stock, promotion, delivery, and tax are recalculated securely on the server.
        </p>
      </aside>
    </form>
  )
}

export { CheckoutForm }
