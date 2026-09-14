import type { Metadata } from 'next'

import type { ProductDetail } from '@/types/product-detail'
import type { SeoContent, StoreSettingsContent } from '@/types/storefront-content'

const getSiteURL = () => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000')
  } catch {
    return new URL('http://localhost:3000')
  }
}

const toAbsoluteURL = (value: null | string | undefined, fallbackPath = '/') => {
  try {
    return new URL(value || fallbackPath, getSiteURL()).toString()
  } catch {
    return new URL(fallbackPath, getSiteURL()).toString()
  }
}

const buildStorefrontMetadata = (
  seo: Partial<SeoContent>,
  settings: StoreSettingsContent,
  fallbackPath: string,
): Metadata => {
  const title = seo.title || settings.storeName
  const description = seo.description || settings.defaultDescription
  const canonical = toAbsoluteURL(seo.canonicalUrl, fallbackPath)
  const image = toAbsoluteURL(seo.image || settings.defaultShareImage)

  return {
    alternates: { canonical },
    description,
    openGraph: {
      description,
      images: [{ alt: title, url: image }],
      siteName: settings.storeName,
      title,
      type: 'website',
      url: canonical,
    },
    title,
  }
}

const buildProductStructuredData = (
  product: ProductDetail,
  seo: SeoContent,
  settings: StoreSettingsContent,
  totalReviews: number,
) => {
  if (!product.name.trim() || !Number.isFinite(product.price) || product.price < 0) return null

  const activeVariants = product.variants?.filter(({ active }) => active) ?? []
  const inStock = activeVariants.some(({ stock }) => stock > 0)

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    ...(totalReviews > 0 && Number.isFinite(product.rating)
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            bestRating: 5,
            ratingCount: totalReviews,
            ratingValue: product.rating,
          },
        }
      : {}),
    description: seo.description,
    image: product.gallery.map((image) => toAbsoluteURL(image)),
    name: product.name,
    offers: {
      '@type': 'Offer',
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      price: product.price,
      priceCurrency: settings.currency,
      url: toAbsoluteURL(seo.canonicalUrl, `/product/${product.slug}`),
    },
    sku: product.sku,
  }
}

const serializeStructuredData = (value: Record<string, unknown>) =>
  JSON.stringify(value).replaceAll('<', '\\u003c')

export {
  buildProductStructuredData,
  buildStorefrontMetadata,
  getSiteURL,
  serializeStructuredData,
  toAbsoluteURL,
}
