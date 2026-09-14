import type { PayloadRequest } from 'payload'

type PreviewEntity = 'categories' | 'footer' | 'header' | 'homepage' | 'products'

const getServerURL = (req?: PayloadRequest) =>
  process.env.NEXT_PUBLIC_SERVER_URL || req?.origin || 'http://localhost:3000'

const getPreviewPath = (entity: PreviewEntity, slug?: null | string) => {
  if (entity === 'products' && slug) return `/product/${encodeURIComponent(slug)}`
  if (entity === 'categories' && slug) return `/category/${encodeURIComponent(slug)}`
  return '/'
}

const getPreviewURL = (entity: PreviewEntity, slug: null | string | undefined, req: PayloadRequest) => {
  const url = new URL('/preview', getServerURL(req))
  url.searchParams.set('entity', entity)
  if (slug) url.searchParams.set('slug', slug)

  return url.toString()
}

export { getPreviewPath, getPreviewURL, getServerURL }
export type { PreviewEntity }
