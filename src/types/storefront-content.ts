import type { Product } from './product'
import type { ProductDetail, ProductReview } from './product-detail'
import type { Testimonial } from './testimonial'

type SeoContent = {
  canonicalUrl?: string
  description: string
  image: string
  title: string
}

type StoreSettingsContent = {
  catalogEnabled: boolean
  currency: 'IDR' | 'USD'
  defaultDescription: string
  defaultShareImage: string
  locale: string
  maintenanceMode: boolean
  storeName: string
  titleTemplate: string
}

type HeaderNavigationItem = {
  label: string
  newTab: boolean
  url: string
}

type HeaderContent = {
  accountLabel: string
  announcementEnabled: boolean
  announcementLinkLabel: string
  announcementLinkUrl: string
  announcementMessage: string
  cartLabel: string
  logoText: string
  navigationItems: HeaderNavigationItem[]
  searchPlaceholder: string
}

type FooterLink = {
  label: string
  newTab?: boolean
  url: string
}

type FooterContent = {
  brandDescription: string
  copyright: string
  legalLinks: FooterLink[]
  linkGroups: Array<{ heading: string; links: FooterLink[] }>
  logoText: string
  newsletterEmailPlaceholder: string
  newsletterHeading: string
  newsletterSubmitLabel: string
  paymentMethods: Array<{ alt: string; image: string; name: string }>
  showNewsletter: boolean
  socialLinks: Array<{ label: string; platform: string; url: string }>
}

type HomepageContent = {
  brands: Array<{ image: string; name: string }>
  dressStyles: Array<{ image: string; name: string; url: string }>
  dressStylesHeading: string
  hero: {
    ctaLabel: string
    ctaUrl: string
    description: string
    heading: string
    image: string
    statistics: Array<{ label: string; value: string }>
  }
  newArrivals: Product[]
  newArrivalsHeading: string
  seo: SeoContent
  structuredDataEnabled: boolean
  testimonials: Testimonial[]
  testimonialsHeading: string
  topSelling: Product[]
  topSellingHeading: string
}

type CatalogSort = 'newest' | 'popular' | 'priceAscending' | 'priceDescending'

type CategoryFilters = {
  brandIds: number[]
  colors: string[]
  maxPrice?: number
  minPrice?: number
  page: number
  sizes: string[]
  sort: CatalogSort
}

type CategoryPageContent = {
  category: {
    description: string
    name: string
    seo: SeoContent
    slug: string
  }
  filters: CategoryFilters
  pagination: {
    hasNextPage: boolean
    hasPrevPage: boolean
    page: number
    totalDocs: number
    totalPages: number
  }
  products: Product[]
}

type ProductDetailPageContent = {
  product: ProductDetail
  relatedProducts: Product[]
  reviews: ProductReview[]
  seo: SeoContent
  totalReviews: number
}

export type {
  CatalogSort,
  CategoryFilters,
  CategoryPageContent,
  FooterContent,
  HeaderContent,
  HeaderNavigationItem,
  HomepageContent,
  ProductDetailPageContent,
  SeoContent,
  StoreSettingsContent,
}
