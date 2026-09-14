import 'server-only'

import { cookies } from 'next/headers'
import { getPayload } from 'payload'

import { resolveCart } from '@/libs/cart-resolver'
import { CART_COOKIE_NAME, decodeCartSession } from '@/libs/cart-session'
import config from '@/payload.config'

const getServerCart = async () => {
  const [cookieStore, payloadConfig] = await Promise.all([cookies(), config])
  const items = decodeCartSession(
    cookieStore.get(CART_COOKIE_NAME)?.value,
    payloadConfig.secret,
  )
  const payload = await getPayload({ config: payloadConfig })

  return resolveCart(payload, items)
}

export { getServerCart }
