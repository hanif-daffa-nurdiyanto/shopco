import Image from 'next/image'

import type { HomepageContent } from '@/types/storefront-content'

const BrandStrip = ({ brands }: { brands: HomepageContent['brands'] }) => (
  <section className="bg-ink px-4 py-10" id="brands">
    <div className="mx-auto flex max-w-site flex-wrap items-center justify-center gap-x-8 gap-y-6 md:justify-between">
      {brands.map((brand) => (
        <div className="relative h-9 w-40" key={brand.name}>
          <Image alt={brand.name} className="object-contain" fill sizes="160px" src={brand.image} />
        </div>
      ))}
    </div>
  </section>
)

export { BrandStrip }
