'use client'

import Image from 'next/image'
import Link from 'next/link'

const OrderSummary = ({ hasItems, subtotal }: { hasItems: boolean; subtotal: number }) => (
    <aside className="rounded-[20px] border border-black/10 p-5 md:p-6">
      <h2 className="text-xl font-bold md:text-2xl">Order Summary</h2>
      <dl className="mt-5 space-y-5 text-base md:text-xl">
        <div className="flex justify-between">
          <dt className="text-muted">Subtotal</dt>
          <dd className="font-bold">${subtotal}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Discount</dt>
          <dd className="font-bold">Calculated at checkout</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Delivery Fee</dt>
          <dd className="font-bold">Calculated at checkout</dd>
        </div>
        <div className="border-t border-black/10 pt-5">
          <div className="flex justify-between">
            <dt>Total</dt>
            <dd className="text-xl font-bold md:text-2xl">${subtotal}</dd>
          </div>
        </div>
      </dl>
      <p className="mt-5 flex items-center gap-2 text-sm text-muted">
        <Image alt="" height={20} src="/images/figma/promo-tag.svg" width={20} />
        Promotion codes are validated securely during checkout.
      </p>
      <Link
        aria-disabled={!hasItems}
        className={`mt-5 flex h-13.5 w-full items-center justify-center gap-3 rounded-full font-medium text-white ${hasItems ? 'bg-ink' : 'pointer-events-none bg-black/30'}`}
        href="/checkout"
      >
        Go to Checkout
        <Image alt="" height={20} src="/images/figma/checkout-arrow.svg" width={20} />
      </Link>
    </aside>
)

export { OrderSummary }
