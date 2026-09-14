import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/breadcrumbs'
import { ProductGallery } from '@/components/product-gallery'
import { ProductPurchasePanel } from '@/components/product-purchase-panel'
import { ProductReviews } from '@/components/product-reviews'
import { RelatedProducts } from '@/components/related-products'
import { getPreviewContext } from '@/libs/preview-context'
import {
  buildProductStructuredData,
  buildStorefrontMetadata,
  serializeStructuredData,
} from '@/libs/seo'
import { getProductDetail, getStoreSettings } from '@/libs/storefront-data'

type Props = {
  params: Promise<{ slug: string }>
}

const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const [{ slug }, preview] = await Promise.all([params, getPreviewContext()])
  const [content, settings] = await Promise.all([
    getProductDetail(slug, preview),
    getStoreSettings(),
  ])
  if (!content) return {}

  return buildStorefrontMetadata(content.seo, settings, `/product/${slug}`)
}

const ProductDetailPage = async ({ params }: Props) => {
  const { slug } = await params
  const preview = await getPreviewContext()
  const [content, settings] = await Promise.all([
    getProductDetail(slug, preview),
    getStoreSettings(),
  ])

  if (!content) notFound()
  const structuredData = buildProductStructuredData(
    content.product,
    content.seo,
    settings,
    content.totalReviews,
  )

  return (
    <main>
      {structuredData && (
        <script
          dangerouslySetInnerHTML={{ __html: serializeStructuredData(structuredData) }}
          type="application/ld+json"
        />
      )}
      <div className="mx-auto max-w-site border-t border-black/10 px-4 pt-6 md:px-0">
        <Breadcrumbs current={content.product.name} items={['Home', 'Shop']} />
        <section className="mt-5 grid gap-8 md:mt-9 md:grid-cols-2 md:gap-10">
          <ProductGallery images={content.product.gallery} name={content.product.name} />
          <ProductPurchasePanel product={content.product} />
        </section>
      </div>
      <ProductReviews
        product={content.product}
        reviews={content.reviews}
        totalReviews={content.totalReviews}
      />
      <RelatedProducts products={content.relatedProducts} />
    </main>
  )
}

export { generateMetadata }
export default ProductDetailPage
