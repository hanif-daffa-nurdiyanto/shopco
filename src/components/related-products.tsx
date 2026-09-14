import type { Product } from '@/types/product'

import { ProductCard } from './product-card'

const RelatedProducts = ({ products }: { products: Product[] }) => {
  if (products.length === 0) return null

  return (
    <section className="mx-auto max-w-site px-4 pt-20 pb-8 md:px-0 md:pt-28 md:pb-12">
      <h2 className="font-display text-center text-[32px] leading-9 font-bold uppercase md:text-5xl">
        You might also like
      </h2>
      <div className="mt-10 grid grid-cols-2 gap-4 md:mt-14 md:grid-cols-4 md:gap-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

export { RelatedProducts }
