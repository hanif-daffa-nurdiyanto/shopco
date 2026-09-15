import { expect, test } from '@playwright/test'

test('keeps storefront gutters at tablet and near the site max width', async ({ page }) => {
  for (const width of [768, 1240, 1260]) {
    await page.setViewportSize({ height: 850, width })

    for (const route of ['/', '/category/casual', '/product/one-life-graphic-t-shirt', '/cart']) {
      await page.goto(`http://localhost:3000${route}`)

      const layout = await page.evaluate(() => ({
        gutters: [...document.querySelectorAll('.max-w-site')].map((element) => {
          const bounds = element.getBoundingClientRect()

          return {
            left: bounds.left,
            right: window.innerWidth - bounds.right,
          }
        }),
        scrollWidth: document.documentElement.scrollWidth,
      }))

      expect(layout.gutters.length).toBeGreaterThan(0)
      expect(layout.gutters.every(({ left, right }) => left >= 16 && right >= 16)).toBe(true)
      expect(layout.scrollWidth).toBeLessThanOrEqual(width)
    }
  }
})
