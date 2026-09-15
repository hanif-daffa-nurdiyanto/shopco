import { expect, test } from '@playwright/test'

test('closes the announcement on mobile and keeps it closed after navigation', async ({ page }) => {
  await page.setViewportSize({ height: 844, width: 390 })
  await page.goto('http://localhost:3000/')

  const closeButton = page.getByRole('button', { name: 'Close announcement' })
  await expect(closeButton).toBeVisible()
  await closeButton.click()
  await expect(closeButton).toHaveCount(0)

  await page.reload()
  await expect(closeButton).toHaveCount(0)

  await page.goto('http://localhost:3000/sign-in')
  await expect(closeButton).toHaveCount(0)
})

test('does not show the announcement when the dismissal cookie is present', async ({
  context,
  page,
}) => {
  await context.addCookies([
    {
      name: 'shopco-announcement-dismissed',
      url: 'http://localhost:3000',
      value: '1',
    },
  ])
  await page.goto('http://localhost:3000/')

  await expect(page.getByRole('button', { name: 'Close announcement' })).toHaveCount(0)
})
