import { expect, test } from '@playwright/test'

test('visual regression with video pause', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })

  await page.goto('http://localhost:3002/', { waitUntil: 'domcontentloaded' })

  const videoLocator = page.locator('video').first()
  await videoLocator.waitFor({ state: 'visible' })

  await page.evaluate(() => {
    const videos = document.querySelectorAll('video')
    videos.forEach((video) => {
      video.pause()
      video.currentTime = 0
    })
  })

  // Wait for all video pauesd
  await page.waitForFunction(
    () =>
      Array.from(document.querySelectorAll('video')).every(
        (v) => (v as HTMLVideoElement).paused,
      ),
    null,
    { timeout: 5000 },
  )

  // delay paused
  await page.waitForTimeout(250)

  await page.evaluate(() =>
    document.documentElement.setAttribute('data-test-disable-transitions', '1'),
  )
  await page.addStyleTag({
    content: `
      [data-test-disable-transitions] *,
      [data-test-disable-transitions] *::before,
      [data-test-disable-transitions] *::after {
        transition: none !important;
        animation: none !important;
      }
    `,
  })

  await expect(page).toHaveScreenshot('landing.png', {
    fullPage: true,
    animations: 'disabled',
    threshold: 0.1,
    maxDiffPixels: 1000,
    mask: [page.locator('[aria-roledescription="slide"]')],
    timeout: 30000,
  })
})
