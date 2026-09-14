import { revalidatePath, revalidateTag } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  PayloadRequest,
} from 'payload'

type Entity = 'brands' | 'categories' | 'products' | 'reviews'
type RevalidationDocument = {
  _status?: null | string
  category?: null | RelationshipValue
  id?: number | string
  product?: null | RelationshipValue
  slug?: null | string
}
type RelationshipValue = { id: number | string; slug?: null | string } | number | string
type RevalidationContext = Record<string, unknown> & {
  revalidatedPaths?: string[]
  skipRevalidation?: boolean
}

const getRelationshipId = (value: null | RelationshipValue | undefined) =>
  value && typeof value === 'object' ? value.id : value

const getRelationshipSlug = async (
  req: PayloadRequest,
  collection: 'categories' | 'products',
  value: null | RelationshipValue | undefined,
) => {
  if (value && typeof value === 'object' && value.slug) return value.slug
  const id = getRelationshipId(value)
  if (id == null) return undefined

  const document = await req.payload.findByID({
    collection,
    depth: 0,
    draft: true,
    id,
    overrideAccess: true,
    req,
    select: { slug: true },
  })
  return document.slug
}

const getBrandCategoryPaths = async (req: PayloadRequest, brand: number | string) => {
  const products = await req.payload.find({
    collection: 'products',
    depth: 1,
    draft: true,
    limit: 100,
    overrideAccess: true,
    pagination: false,
    req,
    select: { category: true },
    where: { brand: { equals: brand } },
  })

  return products.docs.flatMap(({ category }) =>
    typeof category === 'object' && category.slug ? [`/category/${category.slug}`] : [],
  )
}

const applyRevalidation = (
  req: PayloadRequest,
  paths: string[],
  tags: string[],
  layout = false,
) => {
  const context = req.context as RevalidationContext
  if (context.skipRevalidation) return

  const uniquePaths = [...new Set(paths)]
  if (Array.isArray(context.revalidatedPaths)) {
    context.revalidatedPaths.push(...uniquePaths)
    return
  }

  try {
    for (const path of uniquePaths) {
      revalidatePath(path, layout && path === '/' ? 'layout' : 'page')
    }
    for (const tag of new Set(tags)) revalidateTag(tag, 'max')
    req.payload.logger.info(`Revalidated storefront: ${uniquePaths.join(', ')}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown revalidation error'
    req.payload.logger.warn(`Storefront revalidation skipped outside a Next request: ${message}`)
  }
}

const getCollectionRevalidation = async (
  entity: Entity,
  doc: RevalidationDocument,
  previousDoc: RevalidationDocument | undefined,
  req: PayloadRequest,
) => {
  const paths = ['/']
  const tags = [`payload:${entity}`]

  if (entity === 'categories') {
    if (doc.slug) paths.push(`/category/${doc.slug}`)
    if (previousDoc?.slug && previousDoc.slug !== doc.slug) {
      paths.push(`/category/${previousDoc.slug}`)
    }
  }
  if (entity === 'products') {
    if (doc.slug) paths.push(`/product/${doc.slug}`)
    if (previousDoc?.slug && previousDoc.slug !== doc.slug) {
      paths.push(`/product/${previousDoc.slug}`)
    }
    const categorySlugs = await Promise.all([
      getRelationshipSlug(req, 'categories', doc.category),
      getRelationshipSlug(req, 'categories', previousDoc?.category),
    ])
    paths.push(...categorySlugs.filter(Boolean).map((slug) => `/category/${slug}`))
  }
  if (entity === 'reviews') {
    tags.push('payload:products')
    const productSlugs = await Promise.all([
      getRelationshipSlug(req, 'products', doc.product),
      getRelationshipSlug(req, 'products', previousDoc?.product),
    ])
    paths.push(...productSlugs.filter(Boolean).map((slug) => `/product/${slug}`))
  }
  if (entity === 'brands') {
    const brandIDs = [doc.id, previousDoc?.id].filter(
      (id): id is number | string => id != null,
    )
    const categoryPaths = await Promise.all(
      [...new Set(brandIDs)].map((brandID) => getBrandCategoryPaths(req, brandID)),
    )
    paths.push(...categoryPaths.flat())
  }

  applyRevalidation(req, paths, tags)
}

const createCollectionRevalidationHooks = (entity: Entity) => ({
  afterChange: [
    (async ({ doc, previousDoc, req }) => {
      await getCollectionRevalidation(
        entity,
        doc as RevalidationDocument,
        previousDoc as RevalidationDocument | undefined,
        req,
      )
      return doc
    }) satisfies CollectionAfterChangeHook,
  ],
  afterDelete: [
    (async ({ doc, req }) => {
      await getCollectionRevalidation(entity, doc as RevalidationDocument, undefined, req)
      return doc
    }) satisfies CollectionAfterDeleteHook,
  ],
})

const createGlobalRevalidationHook = (
  slug: 'footer' | 'header' | 'homepage' | 'store-settings',
): GlobalAfterChangeHook =>
  ({ doc, req }) => {
    applyRevalidation(
      req,
      ['/'],
      [`payload:${slug}`],
      slug === 'footer' || slug === 'header' || slug === 'store-settings',
    )
    return doc
  }

export { createCollectionRevalidationHooks, createGlobalRevalidationHook }
