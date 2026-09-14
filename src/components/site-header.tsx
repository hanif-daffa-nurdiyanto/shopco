'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

import { CART_UPDATED_EVENT } from '@/libs/cart-events'
import type { HeaderContent } from '@/types/storefront-content'

import { Logo } from './logo'

const root = '/images/figma'

type Props = {
  cartQuantity: number
  content: HeaderContent
}

const SiteHeader = ({ cartQuantity: initialCartQuantity, content }: Props) => {
  const [cartQuantity, setCartQuantity] = useState(initialCartQuantity)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  useEffect(() => {
    const handleCartUpdated = (event: Event) => {
      if (event instanceof CustomEvent && typeof event.detail === 'number') {
        setCartQuantity(event.detail)
      }
    }

    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdated)
    return () => window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdated)
  }, [])

  return (
    <>
      {content.announcementEnabled && content.announcementMessage && (
        <div className="relative flex h-[34px] items-center justify-center bg-ink px-10 text-center text-xs text-white md:h-[38px] md:text-sm">
          {content.announcementMessage}{' '}
          {content.announcementLinkLabel && (
            <a className="ml-1 font-medium underline" href={content.announcementLinkUrl}>
              {content.announcementLinkLabel}
            </a>
          )}
          <button aria-label="Close announcement" className="absolute right-5 hidden md:block">
            <Image alt="" height={20} src={`${root}/close.svg`} width={20} />
          </button>
        </div>
      )}
      <header className="relative mx-auto flex h-16 max-w-site items-center gap-4 px-4 md:h-24 md:gap-10 md:px-0">
        <button aria-label="Open menu" className="grid size-6 content-center gap-1 md:hidden">
          <span className="h-0.5 w-5 bg-ink" />
          <span className="h-0.5 w-5 bg-ink" />
          <span className="h-0.5 w-5 bg-ink" />
        </button>
        <Logo text={content.logoText} />
        <nav className="hidden items-center gap-6 md:flex">
          {content.navigationItems.map((item) => (
            <a
              href={item.url}
              key={`${item.label}-${item.url}`}
              rel={item.newTab ? 'noreferrer' : undefined}
              target={item.newTab ? '_blank' : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <form
          action="/search"
          className="hidden h-12 flex-1 items-center gap-3 rounded-full bg-surface px-4 md:flex"
          method="get"
          role="search"
        >
          <button aria-label="Submit product search" type="submit">
            <Image alt="" height={24} src={`${root}/search.svg`} width={24} />
          </button>
          <input
            aria-label="Search products"
            className="w-full bg-transparent text-muted outline-none"
            name="q"
            placeholder={content.searchPlaceholder}
            type="search"
          />
        </form>
        <div className="ml-auto flex gap-3.5">
          <button
            aria-controls="mobile-product-search"
            aria-expanded={mobileSearchOpen}
            aria-label="Search"
            className="md:hidden"
            onClick={() => setMobileSearchOpen((open) => !open)}
            type="button"
          >
            <Image alt="" height={24} src={`${root}/search.svg`} width={24} />
          </button>
          <a aria-label={content.cartLabel} className="relative" href="/cart">
            <Image alt="" height={24} src={`${root}/cart.svg`} width={24} />
            {cartQuantity > 0 && (
              <span
                aria-label="Cart item count"
                aria-live="polite"
                className="absolute -top-2.5 -right-2.5 flex min-w-4.5 items-center justify-center rounded-full bg-ink px-1 text-[10px] leading-4.5 font-bold text-white"
              >
                {cartQuantity > 99 ? '99+' : cartQuantity}
              </span>
            )}
          </a>
          <a aria-label={content.accountLabel} href="#">
            <Image alt="" height={24} src={`${root}/account.svg`} width={24} />
          </a>
        </div>
        {mobileSearchOpen && (
          <form
            action="/search"
            className="absolute top-full right-4 left-4 z-40 flex h-12 items-center gap-3 rounded-full border border-black/10 bg-white px-4 shadow-lg md:hidden"
            id="mobile-product-search"
            method="get"
            role="search"
          >
            <Image alt="" height={22} src={`${root}/search.svg`} width={22} />
            <input
              aria-label="Search products"
              autoFocus
              className="w-full bg-transparent text-sm outline-none"
              name="q"
              placeholder={content.searchPlaceholder}
              type="search"
            />
            <button className="text-sm font-medium" type="submit">
              Search
            </button>
          </form>
        )}
      </header>
    </>
  )
}

export { SiteHeader }
