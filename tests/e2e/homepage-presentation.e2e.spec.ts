import { expect, test } from '@playwright/test'

test('shows Payload hero statistics and left-centered dress style images', async ({ page }) => {
  const response = await page.request.get('http://localhost:3000/api/globals/homepage?depth=2')
  expect(response.ok()).toBe(true)
  const homepage = (await response.json()) as {
    dressStyles: Array<{
      category: { slug: string }
      image: { url: string }
      label: string
    }>
    statistics: Array<{ label: string; value: string }>
  }

  await page.goto('http://localhost:3000/')

  for (const statistic of homepage.statistics) {
    await expect(page.getByText(statistic.value, { exact: true })).toBeVisible()
    await expect(page.getByText(statistic.label, { exact: true })).toBeVisible()
  }

  for (const style of homepage.dressStyles) {
    const image = page.getByAltText(`${style.label} style`)
    await expect(image).toBeVisible()
    await expect(image).toHaveAttribute('src', new RegExp(encodeURIComponent(style.image.url)))
    await expect(image).toHaveCSS('object-position', '0% 50%')
    await expect(image.locator('..').locator('..')).toHaveAttribute(
      'href',
      `/category/${style.category.slug}`,
    )
  }
})
