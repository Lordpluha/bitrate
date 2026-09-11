import { expect, test } from '@playwright/test'
import { gotoHydrated } from '@tests/support/hydration'

/**
 * Two baselines, because the error state is the one that drifts unnoticed: nothing routinely
 * renders it, so a spacing or colour regression under the fields survives every other layer.
 */
test('login page default state', async ({ page }) => {
  await gotoHydrated(page, '/login')
  await expect(
    page.getByRole('heading', { name: 'Welcome back!' }),
  ).toBeVisible()

  await expect(page).toHaveScreenshot('login-default.png')
})

test('login page with both fields rejected', async ({ page }) => {
  await gotoHydrated(page, '/login')
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByText('Password is required')).toBeVisible()

  await expect(page).toHaveScreenshot('login-invalid.png')
})
