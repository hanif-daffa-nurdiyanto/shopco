import type { ProductSearchPageContent } from '@/types/storefront-content'

import { Pagination } from './pagination'
import { ProductCard } from './product-card'

const ProductSearchResults = ({ content }: { content: ProductSearchPageContent }) => {
  const queryString = new URLSearchParams({ q: content.query }).toString()

  if (!content.query) {
    return (
      <section className="py-16 text-center md:py-24">
        <h1 className="text-3xl font-bold md:text-5xl">Search products</h1>
        <p className="mt-3 text-muted">
          Enter a product name, description, or SKU to start searching.
        </p>
      </section>
    )
  }

  return (
    <section className="py-10 md:py-14">
      <h1 className="text-3xl font-bold md:text-5xl">Search results</h1>
      <p className="mt-3 text-muted">
        {content.pagination.totalDocs} result{content.pagination.totalDocs === 1 ? '' : 's'} for{' '}
        <span className="font-medium text-ink">&ldquo;{content.query}&rdquo;</span>
      </p>
      {content.products.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-x-3.5 gap-y-7 md:grid-cols-3 md:gap-x-5 md:gap-y-9 lg:grid-cols-4">
          {content.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-[20px] bg-surface px-6 py-16 text-center">
          <h2 className="text-xl font-bold">No products found</h2>
          <p className="mt-2 text-muted">Try another product name or a shorter keyword.</p>
        </div>
      )}
      <div className="mt-10">
        <Pagination
          basePath="/search"
          page={content.pagination.page}
          queryString={queryString}
          totalPages={content.pagination.totalPages}
        />
      </div>
    </section>
  )
}

export { ProductSearchResults }
