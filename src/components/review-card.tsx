import Image from 'next/image'

import type { ProductReview } from '@/types/product-detail'

const ReviewCard = ({ review }: { review: ProductReview }) => (
  <article className="rounded-[20px] border border-black/10 p-6 md:px-8 md:py-7">
    <div className="flex justify-between">
      <span className="tracking-[2px] text-star">★★★★★</span>
      <button aria-label="Review options" className="text-xl text-muted">
        •••
      </button>
    </div>
    <h3 className="mt-3 flex items-center gap-1 text-xl font-bold">
      {review.author}
      <Image alt="Verified" height={20} src="/images/figma/verified.svg" width={20} />
    </h3>
    <p className="mt-3 leading-5.5 text-muted">“{review.content}”</p>
    <p className="mt-6 text-sm font-medium text-muted">Posted on {review.date}</p>
  </article>
)

export { ReviewCard }
