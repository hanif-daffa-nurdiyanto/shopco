import { expect, test } from '@playwright/test'

test.describe('Payload storefront', () => {
  test('renders Homepage content from Payload Globals and Collections', async ({ page }) => {
    await page.goto('http://localhost:3000')

    await expect(page).toHaveTitle('Fashion for Every Style')
    await expect(page.locator('h1')).toHaveText('FIND CLOTHES THAT MATCHES YOUR STYLE')
    await expect(page.getByRole('heading', { name: 'NEW ARRIVALS' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'TOP SELLING' })).toBeVisible()
    await expect(page.getByText('T-shirt with Tape Details')).toBeVisible()
    await expect(page.getByText('Shop.co © 2000-2026, All Rights Reserved')).toBeVisible()
  })

  test('shows visible social icons and inverts them on hover', async ({ page }) => {
    await page.goto('http://localhost:3000')

    const facebookLink = page.getByRole('link', { name: /Facebook/i })
    const facebookIcon = facebookLink.locator('[data-social-icon="facebook"]')

    await expect(facebookLink).toHaveCSS('background-color', 'rgb(255, 255, 255)')
    await expect(facebookIcon).toHaveCSS('background-color', 'rgb(0, 0, 0)')

    await facebookLink.hover()

    await expect(facebookLink).toHaveCSS('background-color', 'rgb(0, 0, 0)')
    await expect(facebookIcon).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  })

  test('resets scroll position after opening View All', async ({ page }) => {
    await page.goto('http://localhost:3000')

    const viewAll = page.getByRole('link', { name: 'View All' }).first()
    await viewAll.scrollIntoViewIfNeeded()
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
    await viewAll.click()

    await expect(page).toHaveURL(/\/category\/casual/)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
  })

  test('searches published products from the header on desktop and mobile', async ({ page }) => {
    await page.goto('http://localhost:3000')

    await page.getByLabel('Search products').fill('One Life')
    await page.getByLabel('Search products').press('Enter')

    await expect(page).toHaveURL(/\/search\?q=One(?:\+|%20)Life/)
    await expect(page.getByRole('heading', { name: 'Search results' })).toBeVisible()
    await expect(page.getByText('One Life Graphic T-shirt').first()).toBeVisible()

    await page.setViewportSize({ height: 844, width: 390 })
    await page.goto('http://localhost:3000')
    await page.getByRole('button', { name: 'Search', exact: true }).click()
    await page.getByLabel('Search products').last().fill('Skinny Jeans')
    await page.getByRole('button', { name: 'Search', exact: true }).last().click()

    await expect(page).toHaveURL(/\/search\?q=Skinny(?:\+|%20)Jeans/)
    await expect(page.getByText('Faded Skinny Jeans').first()).toBeVisible()
  })

  test('applies Category filters and sorting from search params', async ({ page }) => {
    await page.goto('http://localhost:3000/category/casual?maxPrice=130&sort=priceAscending')

    await expect(page.getByRole('heading', { name: 'Casual' })).toBeVisible()
    await expect(page.locator('#catalog-sort')).toHaveValue('priceAscending')
    await expect(page.getByLabel('Minimum price')).toHaveValue('0')
    await expect(page.getByLabel('Maximum price')).toHaveValue('130')
    await expect(page.getByText('Black Striped T-shirt')).toBeVisible()
    await expect(page.getByText('Faded Skinny Jeans')).toHaveCount(0)

    await page.getByLabel('Minimum price').fill('100')
    await page.getByLabel('Maximum price').fill('150')
    await page.getByRole('button', { name: 'Apply Filter' }).click()

    await expect(page).toHaveURL(/minPrice=100/)
    await expect(page).toHaveURL(/maxPrice=150/)
    await expect(page.getByText('Gradient Graphic T-shirt')).toBeVisible()

    await page.setViewportSize({ height: 844, width: 390 })
    await page.getByRole('button', { name: 'Open filters' }).click()
    await expect(page.getByLabel('Minimum price').last()).toBeVisible()
    await expect(page.getByLabel('Maximum price').last()).toBeVisible()
  })

  test('renders a useful empty state when Category filters have no matches', async ({ page }) => {
    await page.goto('http://localhost:3000/category/casual?maxPrice=1')

    await expect(page.getByRole('heading', { name: 'No products found' })).toBeVisible()
    await expect(page.getByText('Try removing some filters')).toBeVisible()
  })

  test('renders Product variants, approved reviews, and related products', async ({ page }) => {
    await page.goto('http://localhost:3000/product/one-life-graphic-t-shirt')

    await expect(page.locator('h1')).toHaveText('One Life Graphic T-shirt')
    await expect(page.getByText('All Reviews (6)')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'You might also like' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Select color Black' })).toBeVisible()

    await page.getByRole('tab', { name: 'Product Details' }).click()
    await expect(page.getByRole('heading', { name: 'Product Details' })).toBeVisible()
    await expect(page.getByText('Soft, breathable premium cotton blend.')).toBeVisible()

    await page.getByRole('tab', { name: 'FAQs' }).click()
    await expect(page.getByRole('heading', { name: 'Frequently Asked Questions' })).toBeVisible()
    await page.getByRole('button', { name: 'How should I care for this product?' }).click()
    await expect(page.getByText('Machine wash cold with similar colors.')).toBeVisible()
  })

  test('exposes SEO metadata while keeping anonymous preview requests private', async ({
    page,
    request,
  }) => {
    await page.goto('http://localhost:3000/product/one-life-graphic-t-shirt')

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      /\/product\/one-life-graphic-t-shirt$/,
    )
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /.+/)
    const structuredData = await page.locator('script[type="application/ld\+json"]').textContent()
    expect(structuredData).toContain('"@type":"Product"')

    const previewResponse = await request.get(
      'http://localhost:3000/preview?entity=products&slug=one-life-graphic-t-shirt',
    )
    expect(previewResponse.status()).toBe(401)
  })

  test('keeps the Newsletter below page content on every storefront route', async ({ page }) => {
    const routes = [
      '/',
      '/category/casual',
      '/product/one-life-graphic-t-shirt',
      '/cart',
      '/checkout',
    ]

    for (const route of routes) {
      await page.goto(`http://localhost:3000${route}`)
      const mainBottom = await page
        .locator('main')
        .evaluate((element) => element.getBoundingClientRect().bottom)
      const newsletterTop = await page
        .locator('#newsletter')
        .evaluate((element) => element.getBoundingClientRect().top)

      expect(newsletterTop, `Newsletter overlaps page content on ${route}`).toBeGreaterThanOrEqual(
        mainBottom,
      )
    }
  })

  test('persists minimal cart references and validates checkout promotion on the server', async ({
    page,
  }) => {
    await page.goto('http://localhost:3000/product/one-life-graphic-t-shirt')
    await page.getByRole('button', { name: 'Add to Cart' }).click()
    await expect(page.getByRole('status')).toHaveText('Added to cart.')
    await expect(page.getByLabel('Cart item count')).toHaveText('1')

    await page.goto('http://localhost:3000/cart')
    await expect(page.getByRole('heading', { name: 'One Life Graphic T-shirt' })).toBeVisible()
    await expect(page.getByLabel('Cart item count')).toHaveText('1')
    await page.getByLabel('Promo code').fill('NOT-A-PROMOTION')
    await page.getByRole('button', { name: 'Apply' }).click()
    await expect(page.getByText('Promotion code is invalid.', { exact: true })).toBeVisible()
    await expect(page.getByText('Discount', { exact: true })).toBeVisible()

    await page.getByLabel('Promo code').fill('shopco20')
    await page.getByRole('button', { name: 'Apply' }).click()
    await expect(page.getByRole('status')).toHaveText('Promo code SHOPCO20 applied.')
    await expect(page.getByText('Discount (-20%)')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Go to Checkout' })).toHaveAttribute(
      'href',
      '/checkout?promoCode=SHOPCO20',
    )

    await page.getByRole('button', { name: 'Increase quantity' }).click()
    await expect(page.getByLabel('Cart item count')).toHaveText('2')
    await page.getByLabel('Promo code').fill('SHOPCO20')
    await page.getByRole('button', { name: 'Apply' }).click()
    await expect(page.getByRole('status')).toHaveText('Promo code SHOPCO20 applied.')
    await page.getByRole('link', { name: 'Go to Checkout' }).click()

    await expect(page.getByPlaceholder('Promo code')).toHaveValue('SHOPCO20')
    await page.getByPlaceholder('Full name').fill('E2E Customer')
    await page.getByPlaceholder('Email', { exact: true }).fill('e2e.checkout@example.com')
    await page.getByPlaceholder('Recipient name').fill('E2E Customer')
    await page.getByPlaceholder('Address', { exact: true }).fill('Jl. E2E No. 1')
    await page.getByPlaceholder('City').fill('Jakarta')
    await page.getByPlaceholder('Province').fill('DKI Jakarta')
    await page.getByPlaceholder('Postal code').fill('10110')
    await page.getByPlaceholder('Promo code').fill('INVALID-CODE')
    await page.getByRole('button', { name: 'Place order' }).click()

    await expect(page.getByText('Promotion code is invalid.')).toBeVisible()
  })

  test('returns 404 for unavailable Category and Product slugs', async ({ page }) => {
    const categoryResponse = await page.goto('http://localhost:3000/category/not-available')
    expect(categoryResponse?.status()).toBe(404)

    const productResponse = await page.goto('http://localhost:3000/product/not-available')
    expect(productResponse?.status()).toBe(404)
  })
})
