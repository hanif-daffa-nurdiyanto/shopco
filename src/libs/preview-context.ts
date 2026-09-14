import 'server-only'

import { draftMode, headers } from 'next/headers'
import { getPayload } from 'payload'

import { hasRole } from '@/access'
import config from '@/payload.config'
import type { User } from '@/payload-types'
import type { StorefrontQueryOptions } from '@/libs/storefront-data'

const getPreviewContext = async (): Promise<StorefrontQueryOptions> => {
  const preview = await draftMode()
  if (!preview.isEnabled) return {}

  const payload = await getPayload({ config: await config })
  const authentication = await payload.auth({ headers: await headers() })
  if (!hasRole(authentication.user, ['admin', 'editor'])) return {}

  return { draft: true, user: authentication.user as User }
}

export { getPreviewContext }
