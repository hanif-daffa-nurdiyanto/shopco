import type { Metadata } from 'next'

import { Breadcrumbs } from '@/components/breadcrumbs'
import { CartContent } from '@/components/cart-content'
import { buildStorefrontMetadata } from '@/libs/seo'
import { getServerCart } from '@/libs/storefront-cart'
import { getStoreSettings } from '@/libs/storefront-data'

const generateMetadata = async (): Promise<Metadata> => {
  const settings = await getStoreSettings()
  return buildStorefrontMetadata(
    { description: settings.defaultDescription, title: 'Your Cart' },
    settings,
    '/cart',
  )
}

const CartPage = async () => {
  const [cart, settings] = await Promise.all([getServerCart(), getStoreSettings()])

  return (
    <main className="mx-auto max-w-site border-t border-black/10 px-4 pt-5 md:px-0 md:pt-6">
      <Breadcrumbs current="Cart" items={['Home']} />
      <h1 className="font-display mt-6 text-[32px] leading-none font-bold uppercase md:text-[40px]">
        Your cart
      </h1>
      <CartContent
        initialCart={cart}
        pricing={{
          baseDeliveryFee: settings.defaultDeliveryFee,
          freeDeliveryThreshold: settings.freeShippingThreshold,
        }}
      />
    </main>
  )
}

export { generateMetadata }
export default CartPage
