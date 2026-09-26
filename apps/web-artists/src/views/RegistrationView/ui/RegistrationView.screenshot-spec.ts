import { expect, test } from '@playwright/test'
import { gotoHydrated } from '@tests/support/hydration'

test('registration page default state', async ({ page }) => {
  await gotoHydrated(page, '/registration')
  await expect(
    page.getByRole('heading', {
      name: 'Sign up and immerse yourself in music',
    }),
  ).toBeVisible()

  await expect(page).toHaveScreenshot('registration-default.png')
})
