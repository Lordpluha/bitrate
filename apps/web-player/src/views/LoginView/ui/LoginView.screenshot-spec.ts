import { expect, test } from '@playwright/test'

test('login form mobile layout', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/auth/login', { waitUntil: 'networkidle' })

  await expect(
    page.getByRole('heading', { name: 'Login to your account' }),
  ).toBeVisible()
  await expect(page).toHaveScreenshot('login-mobile.png', {
    fullPage: true,
  })
})
