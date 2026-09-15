import React from 'react'
import type { Metadata } from 'next'
import { cookies } from 'next/headers'

import { LivePreviewListener } from '@/components/live-preview-listener'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { ANNOUNCEMENT_DISMISSED_COOKIE } from '@/libs/announcement-cookie'
import { getPreviewContext } from '@/libs/preview-context'
import { getSiteURL } from '@/libs/seo'
import { getServerCartQuantity } from '@/libs/storefront-cart'
import { getFooter, getHeader, getStoreSettings } from '@/libs/storefront-data'
import { getCurrentUser } from '@/libs/storefront-auth'

import './styles.css'

const generateMetadata = async (): Promise<Metadata> => {
  const settings = await getStoreSettings()

  return {
    description: settings.defaultDescription,
    metadataBase: getSiteURL(),
    openGraph: {
      description: settings.defaultDescription,
      images: [{ url: settings.defaultShareImage }],
      siteName: settings.storeName,
      title: settings.storeName,
      type: 'website',
    },
    title: {
      default: settings.storeName,
      template: settings.titleTemplate,
    },
  }
}

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const preview = await getPreviewContext()
  const [cartQuantity, footer, header, settings, user, cookieStore] = await Promise.all([
    getServerCartQuantity(),
    getFooter(preview),
    getHeader(preview),
    getStoreSettings(),
    getCurrentUser(),
    cookies(),
  ])

  return (
    <html lang={settings.locale.split('-')[0]}>
      <body>
        {preview.draft && <LivePreviewListener serverURL={getSiteURL().origin} />}
        <SiteHeader
          announcementInitiallyDismissed={
            cookieStore.get(ANNOUNCEMENT_DISMISSED_COOKIE)?.value === '1'
          }
          cartQuantity={cartQuantity}
          content={header}
          isAuthenticated={Boolean(user)}
        />
        {settings.maintenanceMode && (
          <p className="bg-sale px-4 py-3 text-center text-sm font-medium text-sale-text">
            SHOP.CO is currently undergoing maintenance. Browsing remains available.
          </p>
        )}
        {children}
        <SiteFooter content={footer} />
      </body>
    </html>
  )
}

export { generateMetadata }
export default RootLayout
