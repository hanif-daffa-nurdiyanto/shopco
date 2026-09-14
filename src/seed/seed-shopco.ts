import 'dotenv/config'

import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { getPayload, type Payload } from 'payload'

import {
  isDevelopmentOrTest,
  updateSeedGlobal,
  upsertCollectionByKey,
  upsertSeedMedia,
} from '@/libs/payload-seed'
import type {
  Brand,
  Category,
  Footer,
  Header,
  Homepage,
  Media,
  Order,
  Product,
  Promotion,
  Review,
  StoreSetting,
} from '@/payload-types'
import config from '@/payload.config'

type AssetDefinition = {
  alt: string
  filename: string
  key: string
}

type ProductDefinition = {
  badge?: Product['badge']
  brand: string
  category: string
  compareAtPrice?: number
  featuredSections?: NonNullable<Product['featuredSections']>
  gallery?: string[]
  image: string
  name: string
  price: number
  slug: string
}

type SeedSummary = {
  brands: number
  categories: number
  media: number
  orders: number
  products: number
  promotions: number
  reviews: number
}

const assetDefinitions: AssetDefinition[] = [
  { key: 'hero', filename: 'hero.png', alt: 'SHOP.CO fashion campaign hero' },
  { key: 'style-casual', filename: 'style-casual.png', alt: 'Casual dress style' },
  { key: 'style-formal', filename: 'style-formal.png', alt: 'Formal dress style' },
  { key: 'style-party', filename: 'style-party.png', alt: 'Party dress style' },
  { key: 'style-gym', filename: 'style-gym.png', alt: 'Gym dress style' },
  { key: 'versace', filename: 'versace.svg', alt: 'Versace logo' },
  { key: 'zara', filename: 'zara.svg', alt: 'Zara logo' },
  { key: 'gucci', filename: 'gucci.svg', alt: 'Gucci logo' },
  { key: 'prada', filename: 'prada.svg', alt: 'Prada logo' },
  { key: 'calvin-klein', filename: 'calvin-klein.svg', alt: 'Calvin Klein logo' },
  { key: 'visa', filename: 'visa.svg', alt: 'Visa payment logo' },
  { key: 'mastercard', filename: 'mastercard.svg', alt: 'Mastercard payment logo' },
  { key: 'paypal', filename: 'paypal.svg', alt: 'PayPal payment logo' },
  { key: 'apple-pay', filename: 'apple-pay.svg', alt: 'Apple Pay payment logo' },
  { key: 'google-pay', filename: 'google-pay.svg', alt: 'Google Pay payment logo' },
  {
    key: 'new-tape-tshirt',
    filename: 'new-tape-tshirt.png',
    alt: 'T-shirt with Tape Details',
  },
  { key: 'new-skinny-jeans', filename: 'new-skinny-jeans.png', alt: 'Skinny Fit Jeans' },
  { key: 'new-checkered-shirt', filename: 'new-checkered-shirt.png', alt: 'Checkered Shirt' },
  {
    key: 'new-sleeve-striped-tshirt',
    filename: 'new-sleeve-striped-tshirt.png',
    alt: 'Sleeve Striped T-shirt',
  },
  {
    key: 'top-vertical-striped-shirt',
    filename: 'top-vertical-striped-shirt.png',
    alt: 'Vertical Striped Shirt',
  },
  {
    key: 'top-courage-tshirt',
    filename: 'top-courage-tshirt.png',
    alt: 'Courage Graphic T-shirt',
  },
  {
    key: 'top-bermuda-shorts',
    filename: 'top-bermuda-shorts.png',
    alt: 'Loose Fit Bermuda Shorts',
  },
  { key: 'top-faded-jeans', filename: 'top-faded-jeans.png', alt: 'Faded Skinny Jeans' },
  {
    key: 'related-contrast-polo',
    filename: 'related-contrast-polo.png',
    alt: 'Polo with Contrast Trims',
  },
  {
    key: 'related-gradient-tshirt',
    filename: 'related-gradient-tshirt.png',
    alt: 'Gradient Graphic T-shirt',
  },
  {
    key: 'related-tipping-polo',
    filename: 'related-tipping-polo.png',
    alt: 'Polo with Tipping Details',
  },
  {
    key: 'related-black-striped-tshirt',
    filename: 'related-black-striped-tshirt.png',
    alt: 'Black Striped T-shirt',
  },
  {
    key: 'detail-one-life-front',
    filename: 'detail-one-life-front.png',
    alt: 'One Life Graphic T-shirt front view',
  },
  {
    key: 'detail-one-life-back',
    filename: 'detail-one-life-back.png',
    alt: 'One Life Graphic T-shirt back view',
  },
  {
    key: 'detail-one-life-model',
    filename: 'detail-one-life-model.png',
    alt: 'One Life Graphic T-shirt model view',
  },
  {
    key: 'cart-checkered-shirt',
    filename: 'cart-checkered-shirt.png',
    alt: 'Checkered Shirt cart crop',
  },
  {
    key: 'cart-gradient-tshirt',
    filename: 'cart-gradient-tshirt.png',
    alt: 'Gradient Graphic T-shirt cart crop',
  },
  {
    key: 'cart-skinny-jeans',
    filename: 'cart-skinny-jeans.png',
    alt: 'Skinny Fit Jeans cart crop',
  },
]

const brandDefinitions = [
  { name: 'Versace', slug: 'versace', logo: 'versace' },
  { name: 'Zara', slug: 'zara', logo: 'zara' },
  { name: 'Gucci', slug: 'gucci', logo: 'gucci' },
  { name: 'Prada', slug: 'prada', logo: 'prada' },
  { name: 'Calvin Klein', slug: 'calvin-klein', logo: 'calvin-klein' },
] as const

const categoryDefinitions = [
  { name: 'Casual', slug: 'casual', image: 'style-casual' },
  { name: 'Formal', slug: 'formal', image: 'style-formal' },
  { name: 'Party', slug: 'party', image: 'style-party' },
  { name: 'Gym', slug: 'gym', image: 'style-gym' },
] as const

const productDefinitions: ProductDefinition[] = [
  {
    name: 'T-shirt with Tape Details',
    slug: 't-shirt-with-tape-details',
    image: 'new-tape-tshirt',
    price: 120,
    category: 'casual',
    brand: 'zara',
    badge: 'new',
    featuredSections: ['newArrivals'],
  },
  {
    name: 'Skinny Fit Jeans',
    slug: 'skinny-fit-jeans',
    image: 'new-skinny-jeans',
    gallery: ['new-skinny-jeans', 'cart-skinny-jeans'],
    price: 240,
    compareAtPrice: 260,
    category: 'casual',
    brand: 'calvin-klein',
    badge: 'sale',
    featuredSections: ['newArrivals'],
  },
  {
    name: 'Checkered Shirt',
    slug: 'checkered-shirt',
    image: 'new-checkered-shirt',
    gallery: ['new-checkered-shirt', 'cart-checkered-shirt'],
    price: 180,
    category: 'formal',
    brand: 'gucci',
    badge: 'new',
    featuredSections: ['newArrivals'],
  },
  {
    name: 'Sleeve Striped T-shirt',
    slug: 'sleeve-striped-t-shirt',
    image: 'new-sleeve-striped-tshirt',
    price: 130,
    compareAtPrice: 160,
    category: 'casual',
    brand: 'prada',
    badge: 'sale',
    featuredSections: ['newArrivals'],
  },
  {
    name: 'Vertical Striped Shirt',
    slug: 'vertical-striped-shirt',
    image: 'top-vertical-striped-shirt',
    price: 212,
    compareAtPrice: 232,
    category: 'formal',
    brand: 'versace',
    badge: 'bestSeller',
    featuredSections: ['topSelling'],
  },
  {
    name: 'Courage Graphic T-shirt',
    slug: 'courage-graphic-t-shirt',
    image: 'top-courage-tshirt',
    price: 145,
    category: 'casual',
    brand: 'zara',
    badge: 'bestSeller',
    featuredSections: ['topSelling'],
  },
  {
    name: 'Loose Fit Bermuda Shorts',
    slug: 'loose-fit-bermuda-shorts',
    image: 'top-bermuda-shorts',
    price: 80,
    category: 'gym',
    brand: 'calvin-klein',
    badge: 'bestSeller',
    featuredSections: ['topSelling'],
  },
  {
    name: 'Faded Skinny Jeans',
    slug: 'faded-skinny-jeans',
    image: 'top-faded-jeans',
    price: 210,
    category: 'casual',
    brand: 'calvin-klein',
    badge: 'bestSeller',
    featuredSections: ['topSelling'],
  },
  {
    name: 'Polo with Contrast Trims',
    slug: 'polo-with-contrast-trims',
    image: 'related-contrast-polo',
    price: 212,
    compareAtPrice: 242,
    category: 'party',
    brand: 'versace',
    badge: 'sale',
  },
  {
    name: 'Gradient Graphic T-shirt',
    slug: 'gradient-graphic-t-shirt',
    image: 'related-gradient-tshirt',
    gallery: ['related-gradient-tshirt', 'cart-gradient-tshirt'],
    price: 145,
    category: 'casual',
    brand: 'gucci',
  },
  {
    name: 'Polo with Tipping Details',
    slug: 'polo-with-tipping-details',
    image: 'related-tipping-polo',
    price: 180,
    category: 'party',
    brand: 'prada',
  },
  {
    name: 'Black Striped T-shirt',
    slug: 'black-striped-t-shirt',
    image: 'related-black-striped-tshirt',
    price: 120,
    compareAtPrice: 150,
    category: 'casual',
    brand: 'zara',
    badge: 'sale',
  },
  {
    name: 'One Life Graphic T-shirt',
    slug: 'one-life-graphic-t-shirt',
    image: 'detail-one-life-front',
    gallery: ['detail-one-life-front', 'detail-one-life-back', 'detail-one-life-model'],
    price: 260,
    compareAtPrice: 300,
    category: 'casual',
    brand: 'versace',
    badge: 'bestSeller',
  },
]

const reviewDefinitions = [
  {
    authorName: 'Sarah M.',
    authorEmail: 'seed.sarah@shop.co',
    content:
      "I'm blown away by the quality and style of the clothes I received from Shop.co. Every piece has exceeded my expectations.",
    rating: 5,
    product: 't-shirt-with-tape-details',
    featured: true,
  },
  {
    authorName: 'Alex K.',
    authorEmail: 'seed.alex.k@shop.co',
    content:
      'The range of options is remarkable, and finding clothes that align with my personal style is finally easy.',
    rating: 5,
    product: 'vertical-striped-shirt',
    featured: true,
  },
  {
    authorName: 'James L.',
    authorEmail: 'seed.james@shop.co',
    content:
      'The selection is diverse and on-point. I keep finding unique fashion pieces that fit perfectly.',
    rating: 5,
    product: 'polo-with-contrast-trims',
    featured: true,
  },
  {
    authorName: 'Samantha D.',
    authorEmail: 'seed.samantha@shop.co',
    content:
      'The design is unique and the fabric feels comfortable. The attention to detail makes it my favorite shirt.',
    rating: 4.5,
    product: 'one-life-graphic-t-shirt',
  },
  {
    authorName: 'Alex M.',
    authorEmail: 'seed.alex.m@shop.co',
    content:
      'The colors are vibrant and the print quality is top-notch. The product exceeded my expectations.',
    rating: 5,
    product: 'one-life-graphic-t-shirt',
  },
  {
    authorName: 'Ethan R.',
    authorEmail: 'seed.ethan@shop.co',
    content:
      'The minimalistic yet stylish pattern caught my eye, and the fit is perfect for everyday wear.',
    rating: 4,
    product: 'one-life-graphic-t-shirt',
  },
  {
    authorName: 'Olivia P.',
    authorEmail: 'seed.olivia@shop.co',
    content:
      'This t-shirt represents simplicity and functionality while still feeling great to wear.',
    rating: 5,
    product: 'one-life-graphic-t-shirt',
  },
  {
    authorName: 'Liam K.',
    authorEmail: 'seed.liam@shop.co',
    content:
      "It's a fusion of comfort and creativity. The soft fabric and thoughtful design work beautifully together.",
    rating: 4.5,
    product: 'one-life-graphic-t-shirt',
  },
  {
    authorName: 'Ava H.',
    authorEmail: 'seed.ava@shop.co',
    content:
      'The intricate details and thoughtful layout make this shirt a genuine conversation starter.',
    rating: 4.5,
    product: 'one-life-graphic-t-shirt',
  },
] as const

const getCollectionCount = async (payload: Payload, collection: Parameters<Payload['count']>[0]['collection']) =>
  (await payload.count({ collection, overrideAccess: true })).totalDocs

const getSeedSummary = async (payload: Payload): Promise<SeedSummary> => ({
  brands: await getCollectionCount(payload, 'brands'),
  categories: await getCollectionCount(payload, 'categories'),
  media: await getCollectionCount(payload, 'media'),
  orders: await getCollectionCount(payload, 'orders'),
  products: await getCollectionCount(payload, 'products'),
  promotions: await getCollectionCount(payload, 'promotions'),
  reviews: await getCollectionCount(payload, 'reviews'),
})

const seedShopco = async (payload: Payload) => {
  const mediaByKey: Record<string, Media> = {}
  for (const asset of assetDefinitions) {
    mediaByKey[asset.key] = await upsertSeedMedia({
      ...asset,
      caption: 'Imported from the SHOP.CO Figma storefront design.',
      payload,
    })
  }

  const brandsBySlug: Record<string, Brand> = {}
  for (const [index, definition] of brandDefinitions.entries()) {
    brandsBySlug[definition.slug] = await upsertCollectionByKey<Brand>({
      collection: 'brands',
      data: {
        _status: 'published',
        name: definition.name,
        slug: definition.slug,
        logo: mediaByKey[definition.logo].id,
        description: `${definition.name} collection available at SHOP.CO.`,
        isActive: true,
        isFeatured: true,
        sortOrder: index,
      },
      draft: false,
      key: { field: 'slug', value: definition.slug },
      payload,
    })
  }

  const categoriesBySlug: Record<string, Category> = {}
  for (const [index, definition] of categoryDefinitions.entries()) {
    categoriesBySlug[definition.slug] = await upsertCollectionByKey<Category>({
      collection: 'categories',
      data: {
        _status: 'published',
        name: definition.name,
        slug: definition.slug,
        description: `Explore the SHOP.CO ${definition.name.toLowerCase()} collection.`,
        heroImage: mediaByKey[definition.image].id,
        defaultSort: 'popular',
        showFilters: true,
        availableFilterGroups: ['price', 'color', 'size', 'brand', 'dressStyle'],
        isVisible: true,
        sortOrder: index,
        meta: {
          title: `${definition.name} Clothing`,
          description: `Shop ${definition.name.toLowerCase()} clothing at SHOP.CO.`,
          image: mediaByKey[definition.image].id,
          canonicalUrl: `/category/${definition.slug}`,
        },
      },
      draft: false,
      key: { field: 'slug', value: definition.slug },
      payload,
    })
  }

  const productsBySlug: Record<string, Product> = {}
  for (const [index, definition] of productDefinitions.entries()) {
    const sku = `SHOP-${definition.slug.replaceAll('-', '_').toUpperCase()}`
    const galleryKeys = definition.gallery ?? [definition.image]

    productsBySlug[definition.slug] = await upsertCollectionByKey<Product>({
      collection: 'products',
      data: {
        _status: 'published',
        name: definition.name,
        slug: definition.slug,
        shortDescription: `${definition.name} combines everyday comfort with signature SHOP.CO style.`,
        details: [
          { label: 'Material', value: 'Soft, breathable premium cotton blend.' },
          { label: 'Care', value: 'Machine wash cold with similar colors.' },
        ],
        featuredImage: mediaByKey[definition.image].id,
        gallery: galleryKeys.map((key) => ({
          image: mediaByKey[key].id,
          altOverride: mediaByKey[key].alt,
        })),
        sku,
        price: definition.price,
        compareAtPrice: definition.compareAtPrice,
        costPrice: Math.round(definition.price * 0.55 * 100) / 100,
        trackInventory: true,
        variants: [
          {
            color: { name: 'Black', hex: '#000000' },
            size: 'M',
            sku: `${sku}-BLACK-M`,
            stock: 12 + index,
            isActive: true,
          },
          {
            color: { name: 'White', hex: '#FFFFFF' },
            size: 'L',
            sku: `${sku}-WHITE-L`,
            priceOverride: definition.price + 5,
            stock: 8 + index,
            isActive: true,
          },
        ],
        badge: definition.badge ?? 'none',
        featuredSections: definition.featuredSections,
        category: categoriesBySlug[definition.category].id,
        brand: brandsBySlug[definition.brand].id,
        visibility: 'catalog',
        isFeatured: Boolean(definition.featuredSections?.length),
        sortPriority: productDefinitions.length - index,
        meta: {
          title: definition.name,
          description: `Shop ${definition.name} at SHOP.CO.`,
          image: mediaByKey[definition.image].id,
          canonicalUrl: `/product/${definition.slug}`,
        },
      },
      draft: false,
      key: { field: 'sku', value: sku },
      payload,
    })
  }

  const relatedProductSlugs = [
    'polo-with-contrast-trims',
    'gradient-graphic-t-shirt',
    'polo-with-tipping-details',
    'black-striped-t-shirt',
  ]
  await upsertCollectionByKey<Product>({
    collection: 'products',
    data: {
      _status: 'published',
      relatedProducts: relatedProductSlugs.map((slug) => productsBySlug[slug].id),
    },
    draft: false,
    key: { field: 'slug', value: 'one-life-graphic-t-shirt' },
    payload,
  })

  for (const definition of categoryDefinitions) {
    const categoryProducts = productDefinitions
      .filter(({ category }) => category === definition.slug)
      .slice(0, 4)
      .map(({ slug }) => productsBySlug[slug].id)

    categoriesBySlug[definition.slug] = await upsertCollectionByKey<Category>({
      collection: 'categories',
      data: { _status: 'published', featuredProducts: categoryProducts },
      draft: false,
      key: { field: 'slug', value: definition.slug },
      payload,
    })
  }

  const reviewsByEmail: Record<string, Review> = {}
  for (const definition of reviewDefinitions) {
    reviewsByEmail[definition.authorEmail] = await upsertCollectionByKey<Review>({
      collection: 'reviews',
      data: {
        ...definition,
        product: productsBySlug[definition.product].id,
        status: 'approved',
        verifiedPurchase: true,
        moderatorNotes: 'Approved storefront seed review.',
      },
      key: { field: 'authorEmail', value: definition.authorEmail },
      payload,
    })
  }

  let promotion: Promotion | undefined
  if (isDevelopmentOrTest()) {
    promotion = await upsertCollectionByKey<Promotion>({
      collection: 'promotions',
      data: {
        code: 'SHOPCO20',
        type: 'percentage',
        value: 20,
        minimumSubtotal: 100,
        maximumDiscount: 80,
        appliesTo: 'categories',
        categories: [categoriesBySlug.casual.id],
        usageLimit: 1_000,
        usageLimitPerCustomer: 1,
        usedCount: 0,
        isActive: true,
        priority: 10,
      },
      key: { field: 'code', value: 'SHOPCO20' },
      payload,
    })

    const orderProduct = productsBySlug['one-life-graphic-t-shirt']
    await upsertCollectionByKey<Order>({
      collection: 'orders',
      data: {
        orderNumber: 'SEED-ORDER-001',
        items: [
          {
            product: orderProduct.id,
            productSnapshotId: String(orderProduct.id),
            categoryId: String(categoriesBySlug.casual.id),
            productName: orderProduct.name,
            sku: orderProduct.sku,
            variant: { color: 'Black', size: 'M' },
            quantity: 1,
            unitPrice: orderProduct.price,
            lineTotal: orderProduct.price,
          },
        ],
        customerName: 'Development Customer',
        customerEmail: 'seed.customer@shop.co',
        customerPhone: '+62 812 0000 0000',
        shippingAddress: {
          recipientName: 'Development Customer',
          line1: 'Jl. Contoh No. 1',
          city: 'Jakarta',
          province: 'DKI Jakarta',
          postalCode: '10110',
          country: 'Indonesia',
        },
        billingSameAsShipping: true,
        deliveryMethod: 'standard',
        paymentProvider: 'manual',
        paymentReference: 'SEED-PAYMENT-001',
        subtotal: 0,
        discount: 0,
        deliveryFee: 15,
        taxRate: 11,
        tax: 0,
        total: 0,
        timeline: [
          {
            status: 'created',
            message: 'Development seed order created.',
            occurredAt: '2026-01-01T00:00:00.000Z',
          },
        ],
        internalNotes: 'Development-only example order.',
        paymentStatus: 'pending',
        fulfillmentStatus: 'unfulfilled',
        promotion: promotion.id,
      },
      key: { field: 'orderNumber', value: 'SEED-ORDER-001' },
      payload,
      updateExisting: false,
    })
  }

  await updateSeedGlobal<StoreSetting>({
    slug: 'store-settings',
    payload,
    data: {
      storeName: 'SHOP.CO',
      supportEmail: 'support@shop.co',
      supportPhone: '+62 21 555 0100',
      locale: 'en-US',
      currency: 'USD',
      defaultProductImage: mediaByKey['new-tape-tshirt'].id,
      defaultDeliveryFee: 15,
      freeShippingThreshold: 250,
      taxRate: 11,
      pricesIncludeTax: false,
      cartSessionMinutes: 1_440,
      titleTemplate: '%s | SHOP.CO',
      defaultDescription:
        'Browse clothes that match your style from leading international brands at SHOP.CO.',
      defaultShareImage: mediaByKey.hero.id,
      maintenanceMode: false,
      catalogEnabled: true,
    },
  })

  await updateSeedGlobal<Header>({
    slug: 'header',
    payload,
    draft: false,
    data: {
      _status: 'published',
      announcementEnabled: true,
      announcementMessage: 'Sign up and get 20% off your first order.',
      announcementLinkLabel: 'Sign Up Now',
      announcementLinkUrl: '/signup',
      logoType: 'text',
      logoText: 'SHOP.CO',
      navigationItems: [
        { label: 'Shop', type: 'internal', category: categoriesBySlug.casual.id },
        { label: 'On Sale', type: 'external', url: '/category/casual?sort=priceAscending' },
        { label: 'New Arrivals', type: 'external', url: '/#new-arrivals' },
        { label: 'Brands', type: 'external', url: '/#brands' },
      ],
      searchPlaceholder: 'Search for products...',
      cartLabel: 'Open cart',
      accountLabel: 'Open account',
      isActive: true,
    },
  })

  await updateSeedGlobal<Footer>({
    slug: 'footer',
    payload,
    draft: false,
    data: {
      _status: 'published',
      logoType: 'text',
      logoText: 'SHOP.CO',
      brandDescription:
        'We have clothes that suit your style and that you are proud to wear, from women to men.',
      socialLinks: [
        { platform: 'twitter', url: 'https://x.com', label: 'SHOP.CO on X' },
        { platform: 'facebook', url: 'https://facebook.com', label: 'SHOP.CO on Facebook' },
        { platform: 'instagram', url: 'https://instagram.com', label: 'SHOP.CO on Instagram' },
        { platform: 'github', url: 'https://github.com', label: 'SHOP.CO on GitHub' },
      ],
      linkGroups: [
        {
          heading: 'Company',
          links: [
            { label: 'About', url: '/about' },
            { label: 'Features', url: '/features' },
            { label: 'Works', url: '/works' },
            { label: 'Career', url: '/career' },
          ],
        },
        {
          heading: 'Help',
          links: [
            { label: 'Customer Support', url: '/support' },
            { label: 'Delivery Details', url: '/delivery' },
            { label: 'Terms & Conditions', url: '/terms' },
            { label: 'Privacy Policy', url: '/privacy' },
          ],
        },
        {
          heading: 'FAQ',
          links: [
            { label: 'Account', url: '/faq/account' },
            { label: 'Manage Deliveries', url: '/faq/deliveries' },
            { label: 'Orders', url: '/faq/orders' },
            { label: 'Payments', url: '/faq/payments' },
          ],
        },
        {
          heading: 'Resources',
          links: [
            { label: 'Free eBooks', url: '/resources/ebooks' },
            { label: 'Development Tutorial', url: '/resources/tutorials' },
            { label: 'How-to Blog', url: '/blog' },
            { label: 'YouTube Playlist', url: 'https://youtube.com', newTab: true },
          ],
        },
      ],
      newsletterHeading: 'STAY UP TO DATE ABOUT OUR LATEST OFFERS',
      newsletterEmailPlaceholder: 'Enter your email address',
      newsletterSubmitLabel: 'Subscribe to Newsletter',
      newsletterSuccessMessage: 'Thanks for subscribing!',
      newsletterErrorMessage: 'Unable to subscribe. Please try again.',
      copyright: 'Shop.co © 2000-2026, All Rights Reserved',
      legalLinks: [
        { label: 'Privacy Policy', url: '/privacy' },
        { label: 'Terms', url: '/terms' },
      ],
      paymentMethods: [
        { name: 'Visa', logo: mediaByKey.visa.id, alt: 'Visa' },
        { name: 'Mastercard', logo: mediaByKey.mastercard.id, alt: 'Mastercard' },
        { name: 'PayPal', logo: mediaByKey.paypal.id, alt: 'PayPal' },
        { name: 'Apple Pay', logo: mediaByKey['apple-pay'].id, alt: 'Apple Pay' },
        { name: 'Google Pay', logo: mediaByKey['google-pay'].id, alt: 'Google Pay' },
      ],
      isActive: true,
      showNewsletter: true,
    },
  })

  const newArrivals = productDefinitions
    .filter(({ featuredSections }) => featuredSections?.includes('newArrivals'))
    .map(({ slug }) => productsBySlug[slug].id)
  const topSelling = productDefinitions
    .filter(({ featuredSections }) => featuredSections?.includes('topSelling'))
    .map(({ slug }) => productsBySlug[slug].id)
  const featuredReviews = reviewDefinitions
    .filter((review) => 'featured' in review && review.featured)
    .map(({ authorEmail }) => reviewsByEmail[authorEmail].id)

  await updateSeedGlobal<Homepage>({
    slug: 'homepage',
    payload,
    draft: false,
    data: {
      _status: 'published',
      heroHeading: 'FIND CLOTHES THAT MATCHES YOUR STYLE',
      heroDescription:
        'Browse through our diverse range of meticulously crafted garments, designed to bring out your individuality.',
      heroCtaLabel: 'Shop Now',
      heroCtaUrl: '/category/casual',
      heroImage: mediaByKey.hero.id,
      heroMobileImage: mediaByKey.hero.id,
      statistics: [
        { value: '200+', label: 'International Brands' },
        { value: '2,000+', label: 'High-Quality Products' },
        { value: '30,000+', label: 'Happy Customers' },
      ],
      brandsHeading: 'Featured Brands',
      brands: brandDefinitions.map(({ slug }) => brandsBySlug[slug].id),
      newArrivalsHeading: 'NEW ARRIVALS',
      newArrivals: { mode: 'manual', products: newArrivals, limit: 4 },
      topSellingHeading: 'TOP SELLING',
      topSelling: { mode: 'manual', products: topSelling, limit: 4 },
      dressStylesHeading: 'BROWSE BY DRESS STYLE',
      dressStyles: categoryDefinitions.map(({ image, name, slug }) => ({
        label: name,
        image: mediaByKey[image].id,
        category: categoriesBySlug[slug].id,
      })),
      testimonialsHeading: 'OUR HAPPY CUSTOMERS',
      testimonials: featuredReviews,
      meta: {
        title: 'Fashion for Every Style',
        description:
          'Discover new arrivals, top-selling clothing, and styles for every occasion at SHOP.CO.',
        image: mediaByKey.hero.id,
        canonicalUrl: '/',
      },
      structuredDataEnabled: true,
    },
  })

  return getSeedSummary(payload)
}

const runSeed = async () => {
  const payload = await getPayload({ config: await config })

  try {
    const summary = await seedShopco(payload)
    payload.logger.info({ message: 'SHOP.CO seed complete', summary })
  } finally {
    await payload.db.destroy?.()
  }
}

const isDirectExecution =
  process.argv[1] != null && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isDirectExecution) {
  runSeed()
    .then(() => process.exit(0))
    .catch((error: unknown) => {
      console.error(error)
      process.exit(1)
    })
}

export { getSeedSummary, seedShopco }
export type { SeedSummary }
