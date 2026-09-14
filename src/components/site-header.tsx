import Image from 'next/image'

import type { HeaderContent } from '@/types/storefront-content'

import { Logo } from './logo'

const root = '/images/figma'

const SiteHeader = ({ content }: { content: HeaderContent }) => (
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
    <header className="mx-auto flex h-16 max-w-site items-center gap-4 px-4 md:h-24 md:gap-10 md:px-0">
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
      <label className="hidden h-12 flex-1 items-center gap-3 rounded-full bg-surface px-4 md:flex">
        <Image alt="" height={24} src={`${root}/search.svg`} width={24} />
        <input
          aria-label="Search products"
          className="w-full bg-transparent text-muted outline-none"
          placeholder={content.searchPlaceholder}
        />
      </label>
      <div className="ml-auto flex gap-3.5">
        <button aria-label="Search" className="md:hidden">
          <Image alt="" height={24} src={`${root}/search.svg`} width={24} />
        </button>
        <a aria-label={content.cartLabel} href="/cart">
          <Image alt="" height={24} src={`${root}/cart.svg`} width={24} />
        </a>
        <a aria-label={content.accountLabel} href="#">
          <Image alt="" height={24} src={`${root}/account.svg`} width={24} />
        </a>
      </div>
    </header>
  </>
)

export { SiteHeader }
