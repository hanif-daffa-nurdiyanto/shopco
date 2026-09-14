'use client'

import Image from 'next/image'
import { useState } from 'react'

import type { ProductDetail, ProductReview } from '@/types/product-detail'

import { ReviewCard } from './review-card'

type ProductTab = 'details' | 'faqs' | 'reviews'

const tabs: Array<{ id: ProductTab; label: string }> = [
  { id: 'details', label: 'Product Details' },
  { id: 'reviews', label: 'Rating & Reviews' },
  { id: 'faqs', label: 'FAQs' },
]

const ProductReviews = ({
  product,
  reviews,
  totalReviews,
}: {
  product: ProductDetail
  reviews: ProductReview[]
  totalReviews: number
}) => {
  const [activeTab, setActiveTab] = useState<ProductTab>('reviews')
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const careInstruction = product.details.find(({ label }) => label.toLowerCase() === 'care')?.value
  const faqs = [
    {
      answer: `Available sizes for this product are ${product.sizes.join(', ')}. Select a size above before adding the item to your cart.`,
      question: 'How do I choose the right size?',
    },
    {
      answer: careInstruction || 'Follow the care instructions shown on the product label.',
      question: 'How should I care for this product?',
    },
    {
      answer:
        'Unused items can be returned in their original condition according to the SHOP.CO return policy.',
      question: 'Can I return or exchange this item?',
    },
  ]

  return (
    <section className="mx-auto mt-20 max-w-site px-4 md:px-0">
      <div
        aria-label="Product information"
        className="grid grid-cols-3 border-b border-black/10 text-center text-sm md:text-base"
        role="tablist"
      >
        {tabs.map((tab) => (
          <button
            aria-controls={`product-panel-${tab.id}`}
            aria-selected={activeTab === tab.id}
            className={`border-b-2 pb-5 transition-colors ${
              activeTab === tab.id ? 'border-ink font-medium text-ink' : 'border-transparent text-muted'
            }`}
            id={`product-tab-${tab.id}`}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'details' && (
        <div
          aria-labelledby="product-tab-details"
          className="py-8 md:py-10"
          id="product-panel-details"
          role="tabpanel"
        >
          <h2 className="text-2xl font-bold">Product Details</h2>
          <p className="mt-4 max-w-3xl leading-7 text-muted">{product.description}</p>
          <dl className="mt-8 grid gap-4 md:max-w-3xl md:grid-cols-2">
            {product.sku && (
              <div className="rounded-2xl bg-surface p-5">
                <dt className="text-sm font-medium text-muted">SKU</dt>
                <dd className="mt-1 font-medium">{product.sku}</dd>
              </div>
            )}
            {product.details.map((detail) => (
              <div className="rounded-2xl bg-surface p-5" key={detail.label}>
                <dt className="text-sm font-medium text-muted">{detail.label}</dt>
                <dd className="mt-1 leading-6">{detail.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div
          aria-labelledby="product-tab-reviews"
          id="product-panel-reviews"
          role="tabpanel"
        >
          <div className="mt-6 flex items-center justify-between">
            <h2 className="text-xl font-bold md:text-2xl">
              All Reviews <span className="text-sm font-normal text-muted">({totalReviews})</span>
            </h2>
            <div className="flex gap-2.5">
              <button
                aria-label="Filter reviews"
                className="flex size-12 items-center justify-center rounded-full bg-surface"
                type="button"
              >
                <Image alt="" height={24} src="/images/figma/filter.svg" width={24} />
              </button>
              <button
                className="hidden h-12 items-center gap-5 rounded-full bg-surface px-5 md:flex"
                type="button"
              >
                Latest{' '}
                <Image alt="" height={16} src="/images/figma/chevron-down.svg" width={16} />
              </button>
              <button
                className="h-12 rounded-full bg-ink px-5 text-sm font-medium text-white md:px-7 md:text-base"
                type="button"
              >
                Write a Review
              </button>
            </div>
          </div>
          {reviews.length > 0 ? (
            <>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
              {totalReviews > reviews.length && (
                <button
                  className="mx-auto mt-9 flex h-13 items-center justify-center rounded-full border border-black/10 px-9"
                  type="button"
                >
                  Load More Reviews
                </button>
              )}
            </>
          ) : (
            <p className="mt-6 rounded-[20px] border border-black/10 p-8 text-center text-muted">
              This product does not have any approved reviews yet.
            </p>
          )}
        </div>
      )}

      {activeTab === 'faqs' && (
        <div
          aria-labelledby="product-tab-faqs"
          className="py-8 md:py-10"
          id="product-panel-faqs"
          role="tabpanel"
        >
          <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
          <div className="mt-6 divide-y divide-black/10 rounded-[20px] border border-black/10 px-5 md:px-7">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index

              return (
                <div key={faq.question}>
                  <button
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 py-5 text-left font-medium"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    type="button"
                  >
                    {faq.question}
                    <span aria-hidden="true" className="text-2xl leading-none">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  {isOpen && <p className="max-w-3xl pb-5 leading-7 text-muted">{faq.answer}</p>}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}

export { ProductReviews }
