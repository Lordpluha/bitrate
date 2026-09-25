import { expect, test } from '@playwright/test'
import { gotoHydrated } from '@tests/support/hydration'

/**
 * The 404 has no other reader: no route renders it on purpose, and the e2e spec only checks that
 * its heading and link exist. A baseline is what notices if it ever loses its styling.
 */
test('not found page', async ({ page }) => {
  await gotoHydrated(page, '/no-such-page')
  await expect(
    page.getByRole('heading', { name: "This page doesn't exist" }),
  ).toBeVisible()

  await expect(page).toHaveScreenshot('not-found.png')
})
