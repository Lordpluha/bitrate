import { expect, test } from '@playwright/test'

/* the static (reduced-motion) landing is the deterministic baseline: no intro, loops or 3D motion */
test.use({ reducedMotion: 'reduce' })

test('landing page default state', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Your music',
  )
  await expect(page.locator('.landing')).toHaveClass(/is-static/)
  await page.evaluate(() => document.fonts.ready)

  /* the stage canvas is GPU output, which differs between machines */
  await expect(page).toHaveScreenshot('landing-default.png', {
    mask: [page.locator('#stage')],
  })
})
