#!/usr/bin/env node
/**
 * Captures the real player for the landing's device previews: the home screen on a desktop and
 * on a phone, in each theme, from the fixture API the screenshot specs use. Run it whenever the
 * player's look changes, so the landing never shows a player that no longer exists.
 *
 * Needs the fixture API and the app running against it (as `playwright.screenshot.config.ts`
 * starts them):
 *   MOCK_API_PORT=3999 node tests/screenshot/mock-api.mjs
 *   API_URL=http://localhost:3999 NEXT_PUBLIC_API_URL=http://localhost:3999 pnpm dev
 *   node scripts/capture-landing-previews.mjs
 *
 * Writes `public/images/landing/player-{desktop,mobile}-{dark,light,dim}.webp`.
 */
import { mkdirSync, readFileSync } from 'node:fs'
import { chromium } from '@playwright/test'
import sharp from 'sharp'

const APP = process.env.BASE_URL ?? 'http://localhost:3001'
const OUT = new URL('../public/images/landing/', import.meta.url)
/** The fixture clock: greetings and relative dates match the screenshot baselines. */
const NOW = new Date('2026-10-19T12:00:00.000Z')
const OVERLAYS = readFileSync(
  new URL('../tests/configs/screenshot-overlays.css', import.meta.url),
  'utf8',
)
const DEVICES = [
  {
    name: 'desktop',
    viewport: { width: 1440, height: 900 },
    scale: 1,
    width: 1440,
  },
  /* phones are drawn small on the landing: twice the pixels keep the text crisp */
  {
    name: 'mobile',
    viewport: { width: 390, height: 844 },
    scale: 2,
    width: 780,
  },
]
const THEMES = ['dark', 'light', 'dim']

mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch()
try {
  for (const device of DEVICES) {
    for (const theme of THEMES) {
      const context = await browser.newContext({
        viewport: device.viewport,
        deviceScaleFactor: device.scale,
        locale: 'en-US',
        timezoneId: 'UTC',
      })
      await context.addCookies([
        { name: 'user_access_token', url: APP, value: 'screenshot' },
      ])
      const page = await context.newPage()
      await page.clock.setFixedTime(NOW)
      await page.addInitScript((stored) => {
        window.localStorage.setItem('theme', JSON.stringify(stored))
      }, theme)
      /* the first visit compiles the route in `next dev` */
      await page.goto(`${APP}/main`, {
        waitUntil: 'networkidle',
        timeout: 180_000,
      })
      await page
        .locator('main')
        .getByRole('heading', { name: 'Recommended for you' })
        .filter({ visible: true })
        .first()
        .waitFor({ timeout: 90_000 })
      await page.addStyleTag({ content: OVERLAYS })
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(600)
      const png = await page.screenshot({
        animations: 'disabled',
        caret: 'hide',
      })
      const file = new URL(`player-${device.name}-${theme}.webp`, OUT)
      await sharp(png)
        .resize({ width: device.width })
        .webp({ quality: 82 })
        .toFile(file.pathname)
      console.log(`wrote ${file.pathname}`)
      await context.close()
    }
  }
} finally {
  await browser.close()
}
