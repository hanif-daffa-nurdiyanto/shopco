import type { Metadata } from 'next'
import Link from 'next/link'

import { Breadcrumbs } from '@/components/breadcrumbs'
import { CheckoutForm } from '@/components/checkout-form'
import { buildStorefrontMetadata } from '@/libs/seo'
import { getServerCart } from '@/libs/storefront-cart'
import { getStoreSettings } from '@/libs/storefront-data'

const generateMetadata = async (): Promise<Metadata> => {
  const settings = await getStoreSettings()
  return buildStorefrontMetadata(
    { description: settings.defaultDescription, title: 'Checkout' },
    settings,
    '/checkout',
  )
}

const CheckoutPage = async () => {
  const cart = await getServerCart()

  return (
    <main className="mx-auto max-w-site border-t border-black/10 px-4 py-6 md:px-0">
      <Breadcrumbs current="Checkout" items={['Home', 'Cart']} />
      {cart.items.length > 0 ? (
        <CheckoutForm cart={cart} />
      ) : (
        <section className="py-24 text-center">
          <h1 className="font-display text-3xl font-bold uppercase">Your cart is empty</h1>
          <Link className="mt-6 inline-flex rounded-full bg-ink px-8 py-3 text-white" href="/">
            Continue shopping
          </Link>
        </section>
      )}
    </main>
  )
}

export { generateMetadata }
export default CheckoutPage
