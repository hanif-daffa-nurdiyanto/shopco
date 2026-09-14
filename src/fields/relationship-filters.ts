import type { Where } from 'payload'

const publishedBrandsFilter: Where = {
  and: [{ _status: { equals: 'published' } }, { isActive: { equals: true } }],
}

const publishedCategoriesFilter: Where = {
  and: [{ _status: { equals: 'published' } }, { isVisible: { equals: true } }],
}

const publishedProductsFilter: Where = {
  and: [{ _status: { equals: 'published' } }, { visibility: { equals: 'catalog' } }],
}

const featuredReviewsFilter: Where = {
  and: [{ status: { equals: 'approved' } }, { featured: { equals: true } }],
}

export {
  featuredReviewsFilter,
  publishedBrandsFilter,
  publishedCategoriesFilter,
  publishedProductsFilter,
}
