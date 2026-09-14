import { unstable_cache } from 'next/cache'
import { getPayload, type Payload, type Where } from 'payload'

import {
  fallbackFooter,
  fallbackHeader,
  fallbackHomepage,
  fallbackStoreSettings,
  getFallbackCategory,
  getFallbackProductDetail,
} from './storefront-fallbacks'

import type {
  Brand,
  Category,
  Footer,
  Header,
  Homepage,
  Media,
  Product as PayloadProduct,
  Review,
  StoreSetting,
  User,
} from '@/payload-types'
import config from '@/payload.config'
import type { Product } from '@/types/product'
import type { ProductReview } from '@/types/product-detail'
import type {
  CatalogSort,
  CategoryFilters,
  CategoryPageContent,
  FooterContent,
  HeaderContent,
  HomepageContent,
  ProductDetailPageContent,
  StoreSettingsContent,
} from '@/types/storefront-content'

type SearchParams = Record<string, string | string[] | undefined>
type StorefrontQueryOptions = { draft?: boolean; user?: User }
type MediaSize = 'openGraph' | 'productCard' | 'productDetail' | 'thumbnail'

const CACHE_SECONDS = 300
const CATEGORY_PAGE_SIZE = 9
const REVIEW_PAGE_SIZE = 6
let payloadPromise: Promise<Payload> | undefined

const getPayloadInstance = () => {
  payloadPromise ??= Promise.resolve(config).then((payloadConfig) =>
    getPayload({ config: payloadConfig }),
  )

  return payloadPromise
}

const isPopulatedMedia = (value: Media | null | number | undefined): value is Media =>
  typeof value === 'object' && value !== null

const getMediaUrl = (
  value: Media | null | number | undefined,
  size?: MediaSize,
  fallback = '/images/figma/hero.png',
) => {
  if (!isPopulatedMedia(value)) return fallback

  return (size && value.sizes?.[size]?.url) || value.url || fallback
}

const isPopulatedProduct = (
  value: PayloadProduct | number | null | undefined,
): value is PayloadProduct => typeof value === 'object' && value !== null

const isPopulatedBrand = (value: Brand | number | null | undefined): value is Brand =>
  typeof value === 'object' && value !== null

const isPopulatedCategory = (value: Category | number | null | undefined): value is Category =>
  typeof value === 'object' && value !== null

const isPopulatedReview = (value: Review | number | null | undefined): value is Review =>
  typeof value === 'object' && value !== null

const getDiscountPercentage = (price: number, compareAtPrice?: null | number) =>
  compareAtPrice && compareAtPrice > price
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : undefined

const mapProduct = (product: PayloadProduct): Product => ({
  discount: getDiscountPercentage(product.price, product.compareAtPrice),
  id: String(product.id),
  image: getMediaUrl(product.featuredImage, 'productCard'),
  name: product.name,
  originalPrice: product.compareAtPrice ?? undefined,
  price: product.price,
  rating: 4.5,
  slug: product.slug,
})

const mapReview = (review: Review): ProductReview => ({
  author: review.authorName,
  content: review.content,
  date: new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(review.createdAt)),
  id: String(review.id),
  rating: review.rating,
})

const queryStoreSettings = async (): Promise<StoreSettingsContent> => {
  const payload = await getPayloadInstance()
  const settings = (await payload.findGlobal({
    depth: 1,
    overrideAccess: false,
    select: {
      catalogEnabled: true,
      currency: true,
      defaultDescription: true,
      defaultShareImage: true,
      locale: true,
      maintenanceMode: true,
      storeName: true,
      titleTemplate: true,
    },
    slug: 'store-settings',
  })) as StoreSetting

  return {
    catalogEnabled: settings.catalogEnabled !== false,
    currency: settings.currency,
    defaultDescription: settings.defaultDescription ?? fallbackStoreSettings.defaultDescription,
    defaultShareImage: getMediaUrl(
      settings.defaultShareImage,
      'openGraph',
      fallbackStoreSettings.defaultShareImage,
    ),
    locale: settings.locale,
    maintenanceMode: settings.maintenanceMode === true,
    storeName: settings.storeName,
    titleTemplate: settings.titleTemplate,
  }
}

const queryHeader = async (options: StorefrontQueryOptions = {}): Promise<HeaderContent> => {
  const payload = await getPayloadInstance()
  const header = (await payload.findGlobal({
    depth: 1,
    draft: options.draft === true,
    overrideAccess: false,
    user: options.user,
    select: {
      accountLabel: true,
      announcementEnabled: true,
      announcementLinkLabel: true,
      announcementLinkUrl: true,
      announcementMessage: true,
      cartLabel: true,
      isActive: true,
      logoText: true,
      navigationItems: true,
      searchPlaceholder: true,
    },
    slug: 'header',
  })) as Header

  if (header.isActive === false) return { ...fallbackHeader, announcementEnabled: false }

  return {
    accountLabel: header.accountLabel,
    announcementEnabled: header.announcementEnabled === true,
    announcementLinkLabel: header.announcementLinkLabel ?? '',
    announcementLinkUrl: header.announcementLinkUrl ?? '#newsletter',
    announcementMessage: header.announcementMessage ?? '',
    cartLabel: header.cartLabel,
    logoText: header.logoText ?? fallbackHeader.logoText,
    navigationItems: (header.navigationItems ?? []).map((item) => ({
      label: item.label,
      newTab: item.newTab === true,
      url:
        item.type === 'internal' && isPopulatedCategory(item.category)
          ? `/category/${item.category.slug}`
          : item.url || '#',
    })),
    searchPlaceholder: header.searchPlaceholder,
  }
}

const queryFooter = async (options: StorefrontQueryOptions = {}): Promise<FooterContent> => {
  const payload = await getPayloadInstance()
  const footer = (await payload.findGlobal({
    depth: 1,
    draft: options.draft === true,
    overrideAccess: false,
    user: options.user,
    select: {
      brandDescription: true,
      copyright: true,
      isActive: true,
      legalLinks: true,
      linkGroups: true,
      logoText: true,
      newsletterEmailPlaceholder: true,
      newsletterHeading: true,
      newsletterSubmitLabel: true,
      paymentMethods: true,
      showNewsletter: true,
      socialLinks: true,
    },
    slug: 'footer',
  })) as Footer

  if (footer.isActive === false) return { ...fallbackFooter, showNewsletter: false }

  return {
    brandDescription: footer.brandDescription ?? fallbackFooter.brandDescription,
    copyright: footer.copyright ?? fallbackFooter.copyright,
    legalLinks: (footer.legalLinks ?? []).map(({ label, url }) => ({ label, url })),
    linkGroups: (footer.linkGroups ?? []).map((group) => ({
      heading: group.heading,
      links: group.links.map(({ label, newTab, url }) => ({
        label,
        newTab: newTab === true,
        url,
      })),
    })),
    logoText: footer.logoText ?? fallbackFooter.logoText,
    newsletterEmailPlaceholder:
      footer.newsletterEmailPlaceholder ?? fallbackFooter.newsletterEmailPlaceholder,
    newsletterHeading: footer.newsletterHeading ?? fallbackFooter.newsletterHeading,
    newsletterSubmitLabel: footer.newsletterSubmitLabel ?? fallbackFooter.newsletterSubmitLabel,
    paymentMethods: (footer.paymentMethods ?? []).map((method) => ({
      alt: method.alt,
      image: getMediaUrl(method.logo, 'thumbnail', '/images/figma/visa.svg'),
      name: method.name,
    })),
    showNewsletter: footer.showNewsletter !== false,
    socialLinks: (footer.socialLinks ?? []).map((social) => ({
      label: social.label ?? `${social.platform} profile`,
      platform: social.platform,
      url: social.url,
    })),
  }
}

const getPopulatedProducts = (values: Homepage['newArrivals']['products']) =>
  (values ?? []).filter(isPopulatedProduct).map(mapProduct)

const queryProductSelector = async (
  payload: Payload,
  selector: Homepage['newArrivals'],
  options: StorefrontQueryOptions = {},
): Promise<Product[]> => {
  if (selector.mode === 'manual') return getPopulatedProducts(selector.products)

  const conditions: Where[] = [
    { visibility: { equals: 'catalog' } },
    { _status: { equals: 'published' } },
  ]
  if (selector.automaticSource === 'featured') conditions.push({ isFeatured: { equals: true } })
  if (
    selector.automaticSource === 'newArrivals' ||
    selector.automaticSource === 'topSelling'
  ) {
    conditions.push({ featuredSections: { contains: selector.automaticSource } })
  }

  const categoryId = isPopulatedCategory(selector.category)
    ? selector.category.id
    : selector.category
  if (categoryId != null) conditions.push({ category: { equals: categoryId } })

  const result = await payload.find({
    collection: 'products',
    depth: 1,
    limit: selector.limit,
    overrideAccess: false,
    pagination: false,
    user: options.user,
    select: {
      compareAtPrice: true,
      featuredImage: true,
      name: true,
      price: true,
      slug: true,
    },
    sort: '-sortPriority',
    where: { and: conditions },
  })

  return result.docs.map((product) => mapProduct(product as PayloadProduct))
}

const queryHomepage = async (options: StorefrontQueryOptions = {}): Promise<HomepageContent> => {
  const payload = await getPayloadInstance()
  const homepage = (await payload.findGlobal({
    depth: 2,
    draft: options.draft === true,
    overrideAccess: false,
    user: options.user,
    select: {
      brands: true,
      dressStyles: true,
      dressStylesHeading: true,
      heroCtaLabel: true,
      heroCtaUrl: true,
      heroDescription: true,
      heroHeading: true,
      heroImage: true,
      meta: true,
      newArrivals: true,
      newArrivalsHeading: true,
      testimonials: true,
      testimonialsHeading: true,
      topSelling: true,
      topSellingHeading: true,
      structuredDataEnabled: true,
    },
    slug: 'homepage',
  })) as Homepage
  const [newArrivals, topSelling] = await Promise.all([
    queryProductSelector(payload, homepage.newArrivals, options),
    queryProductSelector(payload, homepage.topSelling, options),
  ])

  return {
    brands: (homepage.brands ?? []).filter(isPopulatedBrand).map((brand) => ({
      image: getMediaUrl(brand.logo, 'thumbnail', '/images/figma/versace.svg'),
      name: brand.name,
    })),
    dressStyles: (homepage.dressStyles ?? []).map((style) => ({
      image: getMediaUrl(style.image, 'productCard'),
      name: style.label,
      url: isPopulatedCategory(style.category) ? `/category/${style.category.slug}` : '#',
    })),
    dressStylesHeading: homepage.dressStylesHeading ?? fallbackHomepage.dressStylesHeading,
    hero: {
      ctaLabel: homepage.heroCtaLabel ?? fallbackHomepage.hero.ctaLabel,
      ctaUrl: homepage.heroCtaUrl ?? fallbackHomepage.hero.ctaUrl,
      description: homepage.heroDescription ?? fallbackHomepage.hero.description,
      heading: homepage.heroHeading,
      image: getMediaUrl(homepage.heroImage, 'productDetail'),
      statistics: homepage.statistics ?? [],
    },
    newArrivals,
    newArrivalsHeading: homepage.newArrivalsHeading ?? fallbackHomepage.newArrivalsHeading,
    seo: {
      canonicalUrl: homepage.meta?.canonicalUrl ?? '/',
      description:
        homepage.meta?.description ??
        homepage.heroDescription ??
        fallbackHomepage.seo.description,
      image: getMediaUrl(homepage.meta?.image, 'openGraph', fallbackHomepage.seo.image),
      title: homepage.meta?.title ?? fallbackHomepage.seo.title,
    },
    structuredDataEnabled: homepage.structuredDataEnabled !== false,
    testimonials: (homepage.testimonials ?? []).filter(isPopulatedReview).map((review) => ({
      id: String(review.id),
      name: review.authorName,
      quote: review.content,
      rating: review.rating,
    })),
    testimonialsHeading: homepage.testimonialsHeading ?? fallbackHomepage.testimonialsHeading,
    topSelling,
    topSellingHeading: homepage.topSellingHeading ?? fallbackHomepage.topSellingHeading,
  }
}

const getParamValues = (value: string | string[] | undefined) => {
  if (!value) return []
  return (Array.isArray(value) ? value : value.split(',')).filter(Boolean)
}

const getPositiveNumber = (value: string | string[] | undefined) => {
  const parsed = Number(Array.isArray(value) ? value[0] : value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined
}

const parseCategoryFilters = (searchParams: SearchParams): CategoryFilters => {
  const requestedPage = Math.floor(getPositiveNumber(searchParams.page) ?? 1)
  const requestedSort = Array.isArray(searchParams.sort) ? searchParams.sort[0] : searchParams.sort
  const allowedSorts: CatalogSort[] = [
    'popular',
    'newest',
    'priceAscending',
    'priceDescending',
  ]

  return {
    brandIds: getParamValues(searchParams.brand)
      .map(Number)
      .filter((value) => Number.isInteger(value) && value > 0),
    colors: getParamValues(searchParams.color),
    maxPrice: getPositiveNumber(searchParams.maxPrice),
    minPrice: getPositiveNumber(searchParams.minPrice),
    page: Math.max(1, requestedPage),
    sizes: getParamValues(searchParams.size),
    sort: allowedSorts.includes(requestedSort as CatalogSort)
      ? (requestedSort as CatalogSort)
      : 'popular',
  }
}

const getProductSort = (sort: CatalogSort) =>
  ({
    newest: '-publishedAt',
    popular: '-sortPriority',
    priceAscending: 'price',
    priceDescending: '-price',
  })[sort]

const buildProductWhere = (
  categoryId: number,
  filters: CategoryFilters,
  draft = false,
): Where => {
  const conditions: Where[] = [{ category: { equals: categoryId } }]
  if (!draft) {
    conditions.push(
      { visibility: { equals: 'catalog' } },
      { _status: { equals: 'published' } },
    )
  }

  if (filters.minPrice != null) conditions.push({ price: { greater_than_equal: filters.minPrice } })
  if (filters.maxPrice != null) conditions.push({ price: { less_than_equal: filters.maxPrice } })
  if (filters.brandIds.length > 0) conditions.push({ brand: { in: filters.brandIds } })
  if (filters.colors.length > 0) conditions.push({ 'variants.color.hex': { in: filters.colors } })
  if (filters.sizes.length > 0) conditions.push({ 'variants.size': { in: filters.sizes } })

  return { and: conditions }
}

const queryCategoryPage = async (
  slug: string,
  filters: CategoryFilters,
  options: StorefrontQueryOptions = {},
): Promise<CategoryPageContent | null> => {
  const payload = await getPayloadInstance()
  const categoryResult = await payload.find({
    collection: 'categories',
    depth: 1,
    draft: options.draft === true,
    limit: 1,
    overrideAccess: false,
    pagination: false,
    select: { description: true, heroImage: true, meta: true, name: true, slug: true },
    user: options.user,
    where: {
      and: [
        { slug: { equals: slug } },
        ...(options.draft
          ? []
          : [{ isVisible: { equals: true } }, { _status: { equals: 'published' } }]),
      ],
    },
  })
  const category = categoryResult.docs[0]
  if (!category) return null

  const productResult = await payload.find({
    collection: 'products',
    depth: 1,
    limit: CATEGORY_PAGE_SIZE,
    overrideAccess: false,
    page: filters.page,
    pagination: true,
    select: {
      compareAtPrice: true,
      featuredImage: true,
      name: true,
      price: true,
      slug: true,
    },
    user: options.user,
    sort: getProductSort(filters.sort),
    where: buildProductWhere(category.id, filters, options.draft),
  })

  return {
    category: {
      description: category.description ?? '',
      name: category.name,
      seo: {
        canonicalUrl: category.meta?.canonicalUrl ?? `/category/${category.slug}`,
        description: category.meta?.description ?? category.description ?? '',
        image: getMediaUrl(category.meta?.image ?? category.heroImage, 'openGraph'),
        title: category.meta?.title ?? category.name,
      },
      slug: category.slug,
    },
    filters,
    pagination: {
      hasNextPage: productResult.hasNextPage,
      hasPrevPage: productResult.hasPrevPage,
      page: productResult.page ?? filters.page,
      totalDocs: productResult.totalDocs,
      totalPages: productResult.totalPages,
    },
    products: productResult.docs.map((product) => mapProduct(product as PayloadProduct)),
  }
}

const queryApprovedReviews = async (productId: number, page = 1, limit = REVIEW_PAGE_SIZE) => {
  const payload = await getPayloadInstance()
  const result = await payload.find({
    collection: 'reviews',
    depth: 0,
    limit,
    overrideAccess: false,
    page,
    pagination: true,
    select: { authorName: true, content: true, createdAt: true, rating: true },
    sort: '-createdAt',
    where: {
      and: [{ product: { equals: productId } }, { status: { equals: 'approved' } }],
    },
  })

  return {
    docs: result.docs.map((review) => mapReview(review as Review)),
    totalDocs: result.totalDocs,
  }
}

const queryProductDetail = async (
  slug: string,
  options: StorefrontQueryOptions = {},
): Promise<ProductDetailPageContent | null> => {
  const payload = await getPayloadInstance()
  const result = await payload.find({
    collection: 'products',
    depth: 2,
    draft: options.draft === true,
    limit: 1,
    overrideAccess: false,
    pagination: false,
    select: {
      compareAtPrice: true,
      details: {
        label: true,
        value: true,
      },
      featuredImage: true,
      gallery: true,
      meta: true,
      name: true,
      price: true,
      relatedProducts: true,
      shortDescription: true,
      sku: true,
      slug: true,
      variants: true,
    },
    user: options.user,
    where: {
      and: [
        { slug: { equals: slug } },
        ...(options.draft
          ? []
          : [{ visibility: { equals: 'catalog' } }, { _status: { equals: 'published' } }]),
      ],
    },
  })
  const product = result.docs[0] as PayloadProduct | undefined
  if (!product) return null

  const reviewResult = await queryApprovedReviews(product.id)
  const colors = [...new Set((product.variants ?? []).map((variant) => variant.color.hex))]
  const sizes = [...new Set((product.variants ?? []).map((variant) => variant.size))]
  const gallery = (product.gallery ?? []).map(({ image }) =>
    getMediaUrl(image, 'productDetail', getMediaUrl(product.featuredImage, 'productDetail')),
  )

  return {
    product: {
      ...mapProduct(product),
      colors: colors.length > 0 ? colors : ['#000000'],
      description: product.shortDescription,
      details: (product.details ?? []).map(({ label, value }) => ({ label, value })),
      gallery:
        gallery.length > 0 ? gallery : [getMediaUrl(product.featuredImage, 'productDetail')],
      sku: product.sku,
      sizes: sizes.length > 0 ? sizes : ['One Size'],
      variants: (product.variants ?? []).map((variant) => ({
        active: variant.isActive !== false,
        colorHex: variant.color.hex,
        colorName: variant.color.name,
        id: variant.sku,
        price: variant.priceOverride ?? product.price,
        size: variant.size,
        stock: variant.stock,
      })),
    },
    relatedProducts: (product.relatedProducts ?? [])
      .filter(isPopulatedProduct)
      .map(mapProduct),
    reviews: reviewResult.docs,
    seo: {
      canonicalUrl: product.meta?.canonicalUrl ?? `/product/${product.slug}`,
      description: product.meta?.description ?? product.shortDescription,
      image: getMediaUrl(product.meta?.image ?? product.featuredImage, 'openGraph'),
      title: product.meta?.title ?? product.name,
    },
    totalReviews: reviewResult.totalDocs,
  }
}

const cachedStoreSettings = unstable_cache(queryStoreSettings, ['store-settings'], {
  revalidate: CACHE_SECONDS,
  tags: ['payload:store-settings'],
})
const cachedHeader = unstable_cache(queryHeader, ['header'], {
  revalidate: CACHE_SECONDS,
  tags: ['payload:header', 'payload:categories'],
})
const cachedFooter = unstable_cache(queryFooter, ['footer'], {
  revalidate: CACHE_SECONDS,
  tags: ['payload:footer', 'payload:media'],
})
const cachedHomepage = unstable_cache(queryHomepage, ['homepage'], {
  revalidate: CACHE_SECONDS,
  tags: ['payload:homepage', 'payload:products', 'payload:brands', 'payload:reviews'],
})
const cachedCategoryPage = unstable_cache(queryCategoryPage, ['category-page'], {
  revalidate: CACHE_SECONDS,
  tags: ['payload:categories', 'payload:products'],
})
const cachedProductDetail = unstable_cache(queryProductDetail, ['product-detail-v2'], {
  revalidate: CACHE_SECONDS,
  tags: ['payload:products', 'payload:reviews'],
})
const cachedApprovedReviews = unstable_cache(queryApprovedReviews, ['approved-reviews'], {
  revalidate: CACHE_SECONDS,
  tags: ['payload:reviews'],
})

const getStoreSettings = async () => cachedStoreSettings().catch(() => fallbackStoreSettings)
const getHeader = async (options: StorefrontQueryOptions = {}) =>
  options.draft ? queryHeader(options).catch(() => fallbackHeader) : cachedHeader().catch(() => fallbackHeader)
const getFooter = async (options: StorefrontQueryOptions = {}) =>
  options.draft ? queryFooter(options).catch(() => fallbackFooter) : cachedFooter().catch(() => fallbackFooter)
const getHomepage = async (options: StorefrontQueryOptions = {}) =>
  options.draft
    ? queryHomepage(options).catch(() => fallbackHomepage)
    : cachedHomepage().catch(() => fallbackHomepage)
const getCategoryPage = async (
  slug: string,
  searchParams: SearchParams = {},
  options: StorefrontQueryOptions = {},
) => {
  const filters = parseCategoryFilters(searchParams)
  return options.draft
    ? queryCategoryPage(slug, filters, options).catch(() => getFallbackCategory(slug, filters))
    : cachedCategoryPage(slug, filters).catch(() => getFallbackCategory(slug, filters))
}
const getProductDetail = async (slug: string, options: StorefrontQueryOptions = {}) =>
  options.draft
    ? queryProductDetail(slug, options).catch(() => getFallbackProductDetail(slug))
    : cachedProductDetail(slug).catch(() => getFallbackProductDetail(slug))
const getApprovedReviews = async (productId: number, page = 1, limit = REVIEW_PAGE_SIZE) =>
  cachedApprovedReviews(productId, page, limit)

export {
  getApprovedReviews,
  getCategoryPage,
  getFooter,
  getHeader,
  getHomepage,
  getProductDetail,
  getStoreSettings,
  mapProduct,
  parseCategoryFilters,
  queryCategoryPage,
  queryFooter,
  queryHeader,
  queryHomepage,
  queryProductDetail,
  queryStoreSettings,
}
export type { SearchParams, StorefrontQueryOptions }
