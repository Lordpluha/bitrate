import { expect, test } from '@playwright/test'

test.describe('landing page', () => {
  test('shows the primary music discovery heading', async ({ page }) => {
    await page.goto('/')

    await expect(
      page
        .getByRole('heading', {
          name: 'Discover a World of Music with Bitrate',
        })
        .first(),
    ).toBeVisible()
  })
})
