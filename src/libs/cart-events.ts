import type { ResolvedCart } from '@/types/cart'

const CART_UPDATED_EVENT = 'shopco:cart-updated'

const getCartQuantity = (cart: Pick<ResolvedCart, 'items'>) =>
  cart.items.reduce((total, item) => total + item.quantity, 0)

const dispatchCartUpdated = (cart: Pick<ResolvedCart, 'items'>) => {
  window.dispatchEvent(
    new CustomEvent<number>(CART_UPDATED_EVENT, {
      detail: getCartQuantity(cart),
    }),
  )
}

export { CART_UPDATED_EVENT, dispatchCartUpdated, getCartQuantity }
