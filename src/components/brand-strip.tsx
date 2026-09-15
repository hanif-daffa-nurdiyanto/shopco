import Image from 'next/image'

import type { HomepageContent } from '@/types/storefront-content'

const BrandStrip = ({ brands }: { brands: HomepageContent['brands'] }) => (
  <section aria-label="Featured brands" className="overflow-hidden bg-ink py-10" id="brands">
    {brands.length > 0 && (
      <div className="brand-marquee overflow-hidden pl-[max(16px,calc((100vw-1240px)/2))]">
        <div className="brand-marquee-track flex w-max items-center gap-16">
          {[0, 1].map((copy) => (
            <div
              aria-hidden={copy === 1}
              className="flex w-max min-w-[min(1240px,calc(100vw-32px))] shrink-0 items-center justify-between gap-8"
              key={copy}
            >
              {brands.map((brand) => (
                <div className="relative h-9 w-40 shrink-0" key={`${copy}-${brand.name}`}>
                  <Image
                    alt={copy === 0 ? brand.name : ''}
                    className="object-contain"
                    fill
                    sizes="160px"
                    src={brand.image}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    )}
  </section>
)

export { BrandStrip }
