import { test, expect } from '@playwright/test'

test('visual regression example', async ({ page }) => {

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('http://localhost:3002/', { waitUntil: 'domcontentloaded' })
  await page.locator('video').first().waitFor({ state: 'visible' })

  // Disable transitions/animations for deterministic screenshots in tests
  await page.evaluate(() =>
    document.documentElement.setAttribute('data-test-disable-transitions', '1')
  )
  await page.addStyleTag({
    content:
      `
            [data-test-disable-transitions] *,
            [data-test-disable-transitions] *::before,
            [data-test-disable-transitions] *::after {
              transition: none !important;
              animation: none !important;
            }
      `
  })

  await expect(page).toHaveScreenshot({
    fullPage: true,
    animations: 'disabled',
    mask: [
      page.locator('video'),
      page.locator('[aria-roledescription="slide"]')
    ],
    threshold: 0.2,
    maxDiffPixels: 500
  });

})