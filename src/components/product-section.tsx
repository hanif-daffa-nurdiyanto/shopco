import type { Product } from '@/types/product'
import { ProductCard } from './product-card'
import { ScrollToTopLink } from './scroll-to-top-link'

type Props = { id: string; products: Product[]; title: string; separated?: boolean }
const ProductSection = ({ id, products, separated = false, title }: Props) => (
  <section
    className={`mx-auto max-w-site px-4 py-16 md:px-0 md:py-18 ${separated ? 'border-t border-black/10' : ''}`}
    id={id}
  >
    <h2 className="font-display text-center text-[32px] leading-none font-bold uppercase md:text-5xl">
      {title}
    </h2>
    {products.length > 0 ? (
      <div className="mt-8 grid grid-cols-2 gap-4 md:mt-14 md:grid-cols-4 md:gap-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    ) : (
      <p className="mt-8 rounded-[20px] bg-surface p-8 text-center text-muted">
        No products are available in this section yet.
      </p>
    )}
    <ScrollToTopLink
      className="mx-auto mt-9 flex h-13 max-w-54.5 items-center justify-center rounded-full border border-black/10"
      href="/category/casual"
    >
      View All
    </ScrollToTopLink>
  </section>
)

export { ProductSection }
