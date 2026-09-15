import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { SiteHeader } from '@/components/site-header'
import type { HeaderContent } from '@/types/storefront-content'

const content: HeaderContent = {
  accountLabel: 'Account',
  announcementEnabled: true,
  announcementLinkLabel: 'Sign Up Now',
  announcementLinkUrl: '/sign-up',
  announcementMessage: 'Sign up and get 20% off your first order.',
  cartLabel: 'Cart',
  logoText: 'SHOP.CO',
  navigationItems: [],
  searchPlaceholder: 'Search products...',
}

const renderHeader = (announcementInitiallyDismissed: boolean, isAuthenticated: boolean) =>
  renderToStaticMarkup(
    createElement(SiteHeader, {
      announcementInitiallyDismissed,
      cartQuantity: 0,
      content,
      isAuthenticated,
    }),
  )

describe('header announcement visibility', () => {
  it('shows the announcement to guests', () => {
    const html = renderHeader(false, false)

    expect(html).toContain('Close announcement')
    expect(html).toContain(content.announcementMessage)
  })

  it('hides the announcement from authenticated users and dismissed guests', () => {
    expect(renderHeader(false, true)).not.toContain('Close announcement')
    expect(renderHeader(true, false)).not.toContain('Close announcement')
  })
})
