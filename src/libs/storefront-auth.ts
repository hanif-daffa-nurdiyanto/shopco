import 'server-only'

import config from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'

import type { User } from '@/payload-types'

const getCurrentUser = async (): Promise<null | User> => {
  const [requestHeaders, payloadConfig] = await Promise.all([headers(), config])
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers: requestHeaders })

  return (user as null | User) ?? null
}

export { getCurrentUser }
