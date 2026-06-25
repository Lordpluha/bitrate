import { expect, test } from '@playwright/test'

test('Login page visual test', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })

  await page.goto('http://localhost:3002/login', { waitUntil: 'domcontentloaded' })

  await page.getByRole('button', { name: /continue/i }).first().waitFor({state: 'visible'})

  await page.evaluate(() =>
    document.documentElement.setAttribute('data-test-disable-transitions', '1')
  )
  await page.addStyleTag({
    content: `
      [data-test-disable-transitions] *,
      [data-test-disable-transitions] *::before,
      [data-test-disable-transitions] *::after {
        transition: none !important;
        animation: none !important;
      }

      nextjs-portal, 
      #id-nextjs-feedback,
      .__next-root-layout-error-menu {
        display: none !important;
      }
    `
  })

  await expect(page).toHaveScreenshot('landing-login.png', {
    fullPage: true,
    animations: 'disabled',
    threshold: 0.1,
    maxDiffPixels: 500,
  })
})
