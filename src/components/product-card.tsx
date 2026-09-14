import Image from 'next/image'
import type { Product } from '@/types/product'

const ProductCard = ({ product }: { product: Product }) => (
  <article>
    <a href={product.slug ? `/product/${product.slug}` : '#'}>
      <div className="relative aspect-295/298 overflow-hidden rounded-[20px] bg-card">
        <Image
          alt={product.name}
          className="object-cover"
          fill
          sizes="(max-width: 768px) 52vw, 295px"
          src={product.image}
        />
      </div>
      <h3 className="mt-4 truncate text-base font-bold md:text-xl">{product.name}</h3>
    </a>
    <div className="mt-2 flex items-center gap-3">
      <span className="tracking-[1px] text-star">★★★★★</span>
      <span className="text-xs md:text-sm">
        {product.rating}
        <span className="text-muted">/5</span>
      </span>
    </div>
    <div className="mt-1 flex flex-wrap items-center gap-2 text-xl font-bold md:text-2xl">
      <span>${product.price}</span>
      {product.originalPrice && (
        <span className="text-black/40 line-through">${product.originalPrice}</span>
      )}
      {product.discount && (
        <span className="rounded-full bg-sale px-3 py-1 text-xs font-medium text-sale-text">
          -{product.discount}%
        </span>
      )}
    </div>
  </article>
)

export { ProductCard }
