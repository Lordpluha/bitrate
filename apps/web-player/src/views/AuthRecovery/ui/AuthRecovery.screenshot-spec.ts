import { expect, test } from '@playwright/test'

test('password recovery card on a wide screen', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/auth/forgot-password', { waitUntil: 'networkidle' })

  await expect(
    page.getByRole('heading', { name: 'Reset your password' }),
  ).toBeVisible()
  await expect(page).toHaveScreenshot('forgot-password-desktop.png')
})
