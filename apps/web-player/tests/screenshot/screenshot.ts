import { expect, type Locator, type Page } from '@playwright/test'

/** The moment the browser clock is frozen at; `mock-api.mjs` dates its fixtures before it. */
const NOW = new Date('2026-10-19T12:00:00.000Z')

/** Same origin the screenshot config serves the app from. */
const APP_ORIGIN = new URL(process.env.BASE_URL ?? 'http://localhost:3001')
  .origin

export const DESKTOP = { height: 900, width: 1440 } as const
export const MOBILE = { height: 844, width: 390 } as const

type OpenInput = {
  page: Page
  path: string
  /** Stored before load, as the theme switcher stores it; dark when left out. */
  theme?: 'dark' | 'dim' | 'light'
  viewport: { height: number; width: number }
}

/**
 * Opens a page as the signed-in fixture user (any `user_access_token` passes the proxy; the mock
 * API answers `/auth/me`) with the clock frozen, so relative times and greetings are stable.
 */
export const openSignedIn = async ({
  page,
  path,
  theme = 'dark',
  viewport,
}: OpenInput) => {
  await page.clock.setFixedTime(NOW)
  await page.addInitScript((stored) => {
    window.localStorage.setItem('theme', JSON.stringify(stored))
  }, theme)
  await page.setViewportSize(viewport)
  await page
    .context()
    .addCookies([
      { name: 'user_access_token', url: APP_ORIGIN, value: 'screenshot' },
    ])
  await page.goto(path, { waitUntil: 'networkidle' })
}

type SnapInput = {
  /** Waited for before the screenshot, so the shot never catches a loading state. */
  ready: Locator
  name: string
  page: Page
  fullPage?: boolean
}

/** Waits for the page to settle on `ready`, then compares it with the baseline `name`. */
export const snap = async ({
  fullPage = false,
  name,
  page,
  ready,
}: SnapInput) => {
  /* responsive layouts keep hidden copies of a row; wait for the one on screen */
  await expect(ready.filter({ visible: true }).first()).toBeVisible({
    timeout: 60_000,
  })
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveScreenshot(name, { fullPage })
}
