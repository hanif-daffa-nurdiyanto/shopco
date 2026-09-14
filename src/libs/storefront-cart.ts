import 'server-only'

import { cookies } from 'next/headers'
import { getPayload } from 'payload'

import { resolveCart } from '@/libs/cart-resolver'
import { CART_COOKIE_NAME, decodeCartSession } from '@/libs/cart-session'
import config from '@/payload.config'

const getServerCartItems = async () => {
  const [cookieStore, payloadConfig] = await Promise.all([cookies(), config])

  return {
    items: decodeCartSession(cookieStore.get(CART_COOKIE_NAME)?.value, payloadConfig.secret),
    payloadConfig,
  }
}

const getServerCart = async () => {
  const { items, payloadConfig } = await getServerCartItems()
  const payload = await getPayload({ config: payloadConfig })

  return resolveCart(payload, items)
}

const getServerCartQuantity = async () => {
  const { items } = await getServerCartItems()

  return items.reduce((total, item) => total + item.quantity, 0)
}

export { getServerCart, getServerCartQuantity }
