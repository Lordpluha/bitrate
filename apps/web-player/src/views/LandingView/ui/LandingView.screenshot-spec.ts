import { expect, test } from '@playwright/test'

test('landing page default state', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  await expect(
    page
      .getByRole('heading', {
        level: 1,
        name: 'Discover a World of Music with Bitrate',
      })
      .first(),
  ).toBeVisible()

  await expect(page).toHaveScreenshot('landing-default.png')
})
