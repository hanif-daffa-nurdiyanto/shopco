import Image from 'next/image'

import type { HomepageContent } from '@/types/storefront-content'

type Props = Pick<HomepageContent, 'testimonials' | 'testimonialsHeading'>

const TestimonialsSection = ({ testimonials, testimonialsHeading }: Props) => (
  <section className="mx-auto max-w-site px-4 py-16 md:px-0 md:py-20">
    <div className="flex items-end justify-between">
      <h2 className="font-display max-w-[650px] text-[32px] leading-9 font-bold uppercase md:text-5xl">
        {testimonialsHeading}
      </h2>
      <div className="flex gap-4">
        <button aria-label="Previous testimonial">
          <Image alt="" height={24} src="/images/figma/arrow-left.svg" width={24} />
        </button>
        <button aria-label="Next testimonial">
          <Image alt="" height={24} src="/images/figma/arrow-right.svg" width={24} />
        </button>
      </div>
    </div>
    {testimonials.length > 0 ? (
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {testimonials.map((item) => (
          <article
            className="rounded-[20px] border border-black/10 p-6 md:px-8 md:py-7"
            key={item.id}
          >
            <div className="tracking-[3px] text-star">★★★★★</div>
            <h3 className="mt-3 flex items-center gap-1 text-xl font-bold">
              {item.name}
              <Image alt="Verified" height={20} src="/images/figma/verified.svg" width={20} />
            </h3>
            <p className="mt-3 leading-[22px] text-muted">“{item.quote}”</p>
          </article>
        ))}
      </div>
    ) : (
      <p className="mt-10 rounded-[20px] border border-black/10 p-8 text-center text-muted">
        No testimonials are available yet.
      </p>
    )}
  </section>
)

export { TestimonialsSection }
