import type { Metadata } from 'next'

import { Breadcrumbs } from '@/components/breadcrumbs'
import { ProductSearchResults } from '@/components/product-search-results'
import { buildStorefrontMetadata } from '@/libs/seo'
import { getProductSearch, getStoreSettings, type SearchParams } from '@/libs/storefront-data'

type Props = {
  searchParams: Promise<SearchParams>
}

const generateMetadata = async ({ searchParams }: Props): Promise<Metadata> => {
  const [content, settings] = await Promise.all([
    getProductSearch(await searchParams),
    getStoreSettings(),
  ])

  return buildStorefrontMetadata(
    {
      canonicalUrl: '/search',
      description: content.query
        ? `Search results for ${content.query}`
        : 'Search products from our catalog.',
      title: content.query ? `Search: ${content.query}` : 'Search products',
    },
    settings,
    '/search',
  )
}

const SearchPage = async ({ searchParams }: Props) => {
  const content = await getProductSearch(await searchParams)

  return (
    <main className="mx-auto max-w-site border-t border-black/10 px-4 pt-6 md:px-0">
      <Breadcrumbs current="Search" items={['Home']} />
      <ProductSearchResults content={content} />
    </main>
  )
}

export { generateMetadata }
export default SearchPage
