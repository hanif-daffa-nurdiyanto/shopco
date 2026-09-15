'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'

import type { HomepageContent } from '@/types/storefront-content'
import type { Testimonial } from '@/types/testimonial'

type Props = Pick<HomepageContent, 'testimonials' | 'testimonialsHeading'>

const TestimonialCard = ({ item }: { item: Testimonial }) => (
  <article className="h-full rounded-[20px] border border-black/10 bg-white p-6 md:px-8 md:py-7">
    <div aria-label={`${item.rating} out of 5 stars`} className="tracking-[3px] text-star">
      {'★'.repeat(Math.max(0, Math.min(5, Math.round(item.rating))))}
    </div>
    <h3 className="mt-3 flex items-center gap-1 text-xl font-bold">
      {item.name}
      <Image alt="Verified" height={20} src="/images/figma/verified.svg" width={20} />
    </h3>
    <p className="mt-3 leading-[22px] text-muted">“{item.quote}”</p>
  </article>
)

const TestimonialsSection = ({ testimonials, testimonialsHeading }: Props) => {
  const count = testimonials.length
  const [position, setPosition] = useState(count)
  const [transitionEnabled, setTransitionEnabled] = useState(true)
  const moving = useRef(false)
  const slides = [...testimonials, ...testimonials, ...testimonials]

  const move = (direction: -1 | 1) => {
    if (count < 2 || moving.current) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPosition((current) => count + ((current - count + direction + count) % count))
      return
    }

    moving.current = true
    setTransitionEnabled(true)
    setPosition((current) => current + direction)
  }

  const finishMove = () => {
    if (!moving.current) return

    moving.current = false
    if (position < count || position >= count * 2) {
      setTransitionEnabled(false)
      setPosition(position < count ? position + count : position - count)
    }
  }

  return (
    <section className="mx-auto max-w-site px-4 py-16 md:py-20">
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-display text-[32px] leading-9 font-bold uppercase md:text-5xl">
          {testimonialsHeading}
        </h2>
        <div className="flex shrink-0 gap-2 md:gap-4">
          <button
            aria-label="Previous testimonial"
            className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40"
            disabled={count < 2}
            onClick={() => move(-1)}
            type="button"
          >
            <svg aria-hidden="true" fill="none" height="24" viewBox="0 0 24 24" width="24">
              <path d="M20 12H4m0 0 6.5-6.5M4 12l6.5 6.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </button>
          <button
            aria-label="Next testimonial"
            className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40"
            disabled={count < 2}
            onClick={() => move(1)}
            type="button"
          >
            <svg aria-hidden="true" fill="none" height="24" viewBox="0 0 24 24" width="24">
              <path d="M4 12h16m0 0-6.5-6.5M20 12l-6.5 6.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </button>
        </div>
      </div>
      {count > 0 ? (
        <div
          aria-label="Customer testimonials"
          className="relative mt-10 overflow-hidden md:left-1/2 md:w-screen md:-translate-x-1/2"
          role="region"
        >
          <div
            className={`ml-6 flex w-[calc(100%-48px)] gap-5 md:ml-[calc((100vw-min(1240px,100vw-32px)+32px)/2)] md:w-[calc((min(1240px,100vw-32px)-72px)/3)] ${transitionEnabled ? 'transition-transform duration-500 ease-in-out motion-reduce:transition-none' : ''}`}
            onTransitionEnd={finishMove}
            style={{ transform: `translateX(calc(-${position * 100}% - ${position * 20}px))` }}
          >
            {slides.map((item, index) => (
              <div
                aria-hidden={index < position || index >= position + 3}
                className="w-full shrink-0"
                key={`${item.id}-${index}`}
              >
                <TestimonialCard item={item} />
              </div>
            ))}
          </div>
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 hidden w-[calc((100vw-min(1240px,100vw-32px)+32px)/2)] bg-gradient-to-r from-white to-white/20 md:block" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 hidden w-[calc((100vw-min(1240px,100vw-32px)+32px)/2)] bg-gradient-to-l from-white to-white/20 md:block" />
        </div>
      ) : (
        <p className="mt-10 rounded-[20px] border border-black/10 p-8 text-center text-muted">
          No testimonials are available yet.
        </p>
      )}
    </section>
  )
}

export { TestimonialsSection }
