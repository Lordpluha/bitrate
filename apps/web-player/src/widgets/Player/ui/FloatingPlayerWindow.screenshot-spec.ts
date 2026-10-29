import { expect, test } from '@playwright/test'
import { DESKTOP, openSignedIn } from '../../../../tests/screenshot/screenshot'

/**
 * The floating player window. Document picture-in-picture windows are not pages Playwright can
 * reach, so the API is removed and the hook falls back to a popup — the same mirrored element
 * moved into another window.
 */
test('floating player window', async ({ page }) => {
  await page.addInitScript(() => {
    Reflect.deleteProperty(window, 'documentPictureInPicture')
  })
  await openSignedIn({ page, path: '/main/charts', viewport: DESKTOP })

  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByRole('button', { name: 'Open floating player' }).click(),
  ])
  await popup.setViewportSize({ height: 200, width: 320 })

  await expect(popup.getByRole('button', { name: 'Play' })).toBeEnabled()
  await expect(popup.getByRole('button', { name: 'Next track' })).toBeVisible()
  await expect(popup).toHaveScreenshot('floating-player.png')
})
