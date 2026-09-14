import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/breadcrumbs'
import { CategoryCatalog } from '@/components/category-catalog'
import { getPreviewContext } from '@/libs/preview-context'
import { buildStorefrontMetadata } from '@/libs/seo'
import { getCategoryPage, getStoreSettings, type SearchParams } from '@/libs/storefront-data'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<SearchParams>
}

const generateMetadata = async ({ params, searchParams }: Props): Promise<Metadata> => {
  const [{ slug }, query, preview] = await Promise.all([
    params,
    searchParams,
    getPreviewContext(),
  ])
  const [content, settings] = await Promise.all([
    getCategoryPage(slug, query, preview),
    getStoreSettings(),
  ])
  if (!content) return {}

  return buildStorefrontMetadata(content.category.seo, settings, `/category/${slug}`)
}

const CategoryPage = async ({ params, searchParams }: Props) => {
  const [{ slug }, query, preview] = await Promise.all([params, searchParams, getPreviewContext()])
  const content = await getCategoryPage(slug, query, preview)

  if (!content) notFound()

  return (
    <main className="mx-auto max-w-site border-t border-black/10 px-4 pt-6 md:px-0">
      <Breadcrumbs current={content.category.name} items={['Home']} />
      <CategoryCatalog content={content} />
    </main>
  )
}

export { generateMetadata }
export default CategoryPage
