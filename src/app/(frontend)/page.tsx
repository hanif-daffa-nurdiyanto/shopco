import { BrandStrip } from '@/components/brand-strip'
import { DressStyleSection } from '@/components/dress-style-section'
import { HeroSection } from '@/components/hero-section'
import { ProductSection } from '@/components/product-section'
import { TestimonialsSection } from '@/components/testimonials-section'
import { getPreviewContext } from '@/libs/preview-context'
import { buildStorefrontMetadata } from '@/libs/seo'
import { getHomepage, getStoreSettings } from '@/libs/storefront-data'

const generateMetadata = async (): Promise<Metadata> => {
  const preview = await getPreviewContext()
  const [content, settings] = await Promise.all([getHomepage(preview), getStoreSettings()])

  return buildStorefrontMetadata(content.seo, settings, '/')
}

const HomePage = async () => {
  const preview = await getPreviewContext()
  const content = await getHomepage(preview)

  return (
    <main>
      <HeroSection hero={content.hero} />
      <BrandStrip brands={content.brands} />
      <ProductSection
        id="new-arrivals"
        products={content.newArrivals}
        title={content.newArrivalsHeading}
      />
      <ProductSection
        id="top-selling"
        products={content.topSelling}
        separated
        title={content.topSellingHeading}
      />
      <div className="px-4 md:px-0">
        <DressStyleSection
          dressStyles={content.dressStyles}
          dressStylesHeading={content.dressStylesHeading}
        />
      </div>
      <TestimonialsSection
        testimonials={content.testimonials}
        testimonialsHeading={content.testimonialsHeading}
      />
    </main>
  )
}

export { generateMetadata }
export default HomePage
import type { Metadata } from 'next'
