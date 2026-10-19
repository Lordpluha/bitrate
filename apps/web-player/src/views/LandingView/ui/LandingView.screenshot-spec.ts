import { expect, test } from '@playwright/test'

/* the static (reduced-motion) landing is the deterministic baseline: no intro, loops or 3D motion */
test.use({ reducedMotion: 'reduce' })

test('landing page default state', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Your music',
  )
  await expect(page.locator('.landing')).toHaveClass(/(^|\s)is-static(\s|$)/)
  await page.evaluate(() => document.fonts.ready)

  /* the stage canvas is GPU output, which differs between machines; it covers the whole
     viewport, so it is hidden rather than masked (a mask would paint over the page) */
  await page.addStyleTag({ content: '#stage { visibility: hidden; }' })
  await expect(page).toHaveScreenshot('landing-default.png')
})
