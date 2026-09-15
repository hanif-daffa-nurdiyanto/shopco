import { categoryProducts } from './category-data'
import { dressStyles, newArrivals, testimonials, topSelling } from './home-data'
import { featuredProduct, productReviews, relatedProducts } from './product-detail-data'

import type {
  CategoryFilters,
  CategoryPageContent,
  FooterContent,
  HeaderContent,
  HomepageContent,
  ProductDetailPageContent,
  StoreSettingsContent,
} from '@/types/storefront-content'

const fallbackStoreSettings: StoreSettingsContent = {
  catalogEnabled: true,
  currency: 'USD',
  defaultDeliveryFee: 15,
  defaultDescription: 'Find clothes that match your style at SHOP.CO.',
  defaultShareImage: '/images/figma/hero.png',
  freeShippingThreshold: 250,
  locale: 'en-US',
  maintenanceMode: false,
  storeName: 'SHOP.CO',
  titleTemplate: '%s | SHOP.CO',
}

const fallbackHeader: HeaderContent = {
  accountLabel: 'Open account',
  announcementEnabled: true,
  announcementLinkLabel: 'Sign Up Now',
  announcementLinkUrl: '#newsletter',
  announcementMessage: 'Sign up and get 20% off your first order.',
  cartLabel: 'Open cart',
  logoText: 'SHOP.CO',
  navigationItems: [
    { label: 'Shop', newTab: false, url: '/category/casual' },
    { label: 'On Sale', newTab: false, url: '/#top-selling' },
    { label: 'New Arrivals', newTab: false, url: '/#new-arrivals' },
    { label: 'Brands', newTab: false, url: '/#brands' },
  ],
  searchPlaceholder: 'Search for products...',
}

const fallbackFooter: FooterContent = {
  brandDescription:
    'We have clothes that suit your style and that you are proud to wear, from women to men.',
  copyright: 'Shop.co © 2000-2026, All Rights Reserved',
  legalLinks: [
    { label: 'Privacy Policy', url: '/privacy' },
    { label: 'Terms', url: '/terms' },
  ],
  linkGroups: [
    {
      heading: 'Company',
      links: ['About', 'Features', 'Works', 'Career'].map((label) => ({
        label,
        url: '#',
      })),
    },
    {
      heading: 'Help',
      links: ['Customer Support', 'Delivery Details', 'Terms & Conditions', 'Privacy Policy'].map(
        (label) => ({ label, url: '#' }),
      ),
    },
    {
      heading: 'FAQ',
      links: ['Account', 'Manage Deliveries', 'Orders', 'Payments'].map((label) => ({
        label,
        url: '#',
      })),
    },
    {
      heading: 'Resources',
      links: ['Free eBooks', 'Development Tutorial', 'How-to Blog', 'YouTube Playlist'].map(
        (label) => ({ label, url: '#' }),
      ),
    },
  ],
  logoText: 'SHOP.CO',
  newsletterEmailPlaceholder: 'Enter your email address',
  newsletterHeading: 'STAY UP TO DATE ABOUT OUR LATEST OFFERS',
  newsletterSubmitLabel: 'Subscribe to Newsletter',
  paymentMethods: ['visa', 'mastercard', 'paypal', 'apple-pay', 'google-pay'].map((name) => ({
    alt: `${name} payment method`,
    image: `/images/figma/${name}.svg`,
    name,
  })),
  showNewsletter: true,
  socialLinks: ['twitter', 'facebook', 'instagram', 'github'].map((platform) => ({
    label: `SHOP.CO on ${platform}`,
    platform,
    url: '#',
  })),
}

const fallbackHomepage: HomepageContent = {
  brands: [
    ['versace', 'Versace'],
    ['zara', 'Zara'],
    ['gucci', 'Gucci'],
    ['prada', 'Prada'],
    ['calvin-klein', 'Calvin Klein'],
  ].map(([file, name]) => ({ image: `/images/figma/${file}.svg`, name })),
  dressStyles: dressStyles.map(({ image, name }) => ({
    image,
    name,
    url: `/category/${name.toLowerCase()}`,
  })),
  dressStylesHeading: 'BROWSE BY DRESS STYLE',
  hero: {
    ctaLabel: 'Shop Now',
    ctaUrl: '#new-arrivals',
    description:
      'Browse through our diverse range of meticulously crafted garments, designed to bring out your individuality and cater to your sense of style.',
    heading: 'Find clothes that matches your style',
    image: '/images/figma/hero.png',
    statistics: [
      { value: '200+', label: 'International Brands' },
      { value: '2,000+', label: 'High-Quality Products' },
      { value: '30,000+', label: 'Happy Customers' },
    ],
  },
  newArrivals: newArrivals.map((product) => ({ ...product, slug: product.id })),
  newArrivalsHeading: 'NEW ARRIVALS',
  seo: {
    canonicalUrl: '/',
    description: fallbackStoreSettings.defaultDescription,
    image: fallbackStoreSettings.defaultShareImage,
    title: 'Find Your Style',
  },
  structuredDataEnabled: true,
  testimonials,
  testimonialsHeading: 'OUR HAPPY CUSTOMERS',
  topSelling: topSelling.map((product) => ({ ...product, slug: product.id })),
  topSellingHeading: 'TOP SELLING',
}

const getFallbackCategory = (
  slug: string,
  filters: CategoryFilters,
): CategoryPageContent | null => {
  if (slug !== 'casual') return null

  const pageSize = 9
  const start = (filters.page - 1) * pageSize
  const products = categoryProducts.map((product) => ({ ...product, slug: product.id }))

  return {
    category: {
      description: 'Casual clothing for comfortable everyday style.',
      name: 'Casual',
      seo: {
        canonicalUrl: `/category/${slug}`,
        description: 'Casual clothing for comfortable everyday style.',
        image: fallbackStoreSettings.defaultShareImage,
        title: 'Casual',
      },
      slug,
    },
    filters,
    pagination: {
      hasNextPage: start + pageSize < products.length,
      hasPrevPage: filters.page > 1,
      page: filters.page,
      totalDocs: products.length,
      totalPages: Math.max(1, Math.ceil(products.length / pageSize)),
    },
    products: products.slice(start, start + pageSize),
  }
}

const getFallbackProductDetail = (slug: string): ProductDetailPageContent | null =>
  slug === 'one-life-graphic-t-shirt'
    ? {
        product: { ...featuredProduct, slug },
        relatedProducts: relatedProducts.map((product) => ({ ...product, slug: product.id })),
        reviews: productReviews,
        seo: {
          canonicalUrl: `/product/${slug}`,
          description: featuredProduct.description,
          image: featuredProduct.image,
          title: featuredProduct.name,
        },
        totalReviews: productReviews.length,
      }
    : null

export {
  fallbackFooter,
  fallbackHeader,
  fallbackHomepage,
  fallbackStoreSettings,
  getFallbackCategory,
  getFallbackProductDetail,
}
