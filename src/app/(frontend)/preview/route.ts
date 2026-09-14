import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import { hasRole } from '@/access'
import { getPreviewPath, type PreviewEntity } from '@/libs/live-preview'
import config from '@/payload.config'

const previewEntities: PreviewEntity[] = ['categories', 'footer', 'header', 'homepage', 'products']

const GET = async (request: Request) => {
  const payload = await getPayload({ config: await config })
  const authentication = await payload.auth({ headers: request.headers })
  if (!hasRole(authentication.user, ['admin', 'editor'])) {
    return Response.json({ error: 'Authenticated editor preview required.' }, { status: 401 })
  }

  const url = new URL(request.url)
  const entity = url.searchParams.get('entity') as PreviewEntity
  const slug = url.searchParams.get('slug')
  if (!previewEntities.includes(entity)) {
    return Response.json({ error: 'Preview entity is invalid.' }, { status: 400 })
  }
  if ((entity === 'products' || entity === 'categories') && !slug) {
    return Response.json({ error: 'Preview slug is required.' }, { status: 400 })
  }

  const preview = await draftMode()
  preview.enable()
  redirect(new URL(getPreviewPath(entity, slug), request.url).toString())
}

export { GET }
