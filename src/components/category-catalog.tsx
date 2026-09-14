'use client'

import Image from 'next/image'
import { useState } from 'react'

import type { CategoryPageContent } from '@/types/storefront-content'

import { CategoryFilters } from './category-filters'
import { Pagination } from './pagination'
import { ProductCard } from './product-card'

const getQueryString = (filters: CategoryPageContent['filters']) => {
  const params = new URLSearchParams()
  params.set('sort', filters.sort)
  if (filters.minPrice != null) params.set('minPrice', String(filters.minPrice))
  if (filters.maxPrice != null) params.set('maxPrice', String(filters.maxPrice))
  filters.colors.forEach((color) => params.append('color', color))
  filters.sizes.forEach((size) => params.append('size', size))
  filters.brandIds.forEach((brand) => params.append('brand', String(brand)))
  return params.toString()
}

const CategoryCatalog = ({ content }: { content: CategoryPageContent }) => {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const basePath = `/category/${content.category.slug}`
  const firstVisible =
    content.pagination.totalDocs === 0
      ? 0
      : (content.pagination.page - 1) * 9 + 1
  const lastVisible = Math.min(content.pagination.page * 9, content.pagination.totalDocs)

  return (
    <section className="mt-6 grid gap-5 md:grid-cols-[295px_1fr]">
      <div className="hidden md:block">
        <CategoryFilters action={basePath} filters={content.filters} />
      </div>
      <div>
        <div className="mb-7 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold md:text-[32px]">{content.category.name}</h1>
            {content.category.description && (
              <p className="mt-1 hidden text-sm text-muted md:block">{content.category.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-muted">
            <span className="hidden md:inline">
              Showing {firstVisible}-{lastVisible} of {content.pagination.totalDocs} Products
            </span>
            <form action={basePath} className="hidden items-center gap-1 md:flex" method="get">
              {content.filters.minPrice != null && (
                <input name="minPrice" type="hidden" value={content.filters.minPrice} />
              )}
              {content.filters.maxPrice != null && (
                <input name="maxPrice" type="hidden" value={content.filters.maxPrice} />
              )}
              {content.filters.colors.map((color) => (
                <input key={color} name="color" type="hidden" value={color} />
              ))}
              {content.filters.sizes.map((size) => (
                <input key={size} name="size" type="hidden" value={size} />
              ))}
              <label htmlFor="catalog-sort">Sort by:</label>
              <select
                className="bg-transparent font-medium text-ink outline-none"
                defaultValue={content.filters.sort}
                id="catalog-sort"
                name="sort"
                onChange={(event) => event.currentTarget.form?.requestSubmit()}
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="priceAscending">Price: Low to High</option>
                <option value="priceDescending">Price: High to Low</option>
              </select>
            </form>
            <button
              aria-label="Open filters"
              className="flex size-10 items-center justify-center rounded-full bg-surface md:hidden"
              onClick={() => setFiltersOpen(true)}
            >
              <Image alt="" height={20} src="/images/figma/filter.svg" width={20} />
            </button>
          </div>
        </div>
        {content.products.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-3.5 gap-y-7 md:grid-cols-3 md:gap-x-5 md:gap-y-9">
            {content.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-[20px] bg-surface px-6 py-16 text-center">
            <h2 className="text-xl font-bold">No products found</h2>
            <p className="mt-2 text-muted">Try removing some filters or choosing another category.</p>
          </div>
        )}
        <div className="mt-8">
          <Pagination
            basePath={basePath}
            page={content.pagination.page}
            queryString={getQueryString(content.filters)}
            totalPages={content.pagination.totalPages}
          />
        </div>
      </div>
      {filtersOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 md:hidden"
          onClick={() => setFiltersOpen(false)}
        >
          <div
            className="absolute right-0 bottom-0 left-0 max-h-[92vh] overflow-y-auto rounded-t-[24px] bg-white p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-black/20" />
            <CategoryFilters
              action={basePath}
              filters={content.filters}
              onApply={() => setFiltersOpen(false)}
            />
          </div>
        </div>
      )}
    </section>
  )
}

export { CategoryCatalog }
