import { resolve } from 'node:path'
import { expect, type Page, test } from '@playwright/test'

/**
 * Real playback through the one `<bitrate-player>` web-player plays with, on every surface that
 * mirrors it. The fixture API streams the CMAF fixture of `@bitrate/player` (12 one-second
 * fragments at 64 and 192 kbps) for every track. See `playwright.player.config.ts`.
 */
type PlayerState = {
  status: string
  key: string | null
  currentTime: number
  duration: number
  volume: number
  bitrate: number | null
}

const APP_ORIGIN = new URL(process.env.BASE_URL ?? 'http://localhost:3001')
  .origin

/** The dev overlays and toasts the screenshot suite hides; on phones they cover the island. */
const OVERLAYS = resolve(
  __dirname,
  '../../../../tests/configs/screenshot-overlays.css',
)

const open = async (page: Page, path = '/main/charts') => {
  await page
    .context()
    .addCookies([{ name: 'user_access_token', url: APP_ORIGIN, value: 'e2e' }])
  await page.goto(path)
  await expect(page.locator('bitrate-player[media-session]')).toBeAttached()
  await page.addStyleTag({ path: OVERLAYS })
}

/** The playing element's own state — what every surface mirrors. */
const state = (page: Page) =>
  page.evaluate(() => {
    const element = document.querySelector('bitrate-player[media-session]')
    if (!element || !('state' in element))
      throw new Error('playing element missing')
    return element.state as PlayerState
  })

const playButton = (page: Page) =>
  page.getByRole('button', { exact: true, name: 'Play' }).first()

const pauseButton = (page: Page) =>
  page.getByRole('button', { exact: true, name: 'Pause' }).first()

test.describe('desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'the desktop bar is hidden on phones')

  test('plays, pauses and seeks from the player bar', async ({ page }) => {
    await open(page)

    await playButton(page).click()
    await expect(pauseButton(page)).toBeVisible()
    await expect.poll(async () => (await state(page)).status).toBe('playing')
    await expect
      .poll(async () => (await state(page)).currentTime)
      .toBeGreaterThan(0.5)

    await page.getByRole('slider', { name: 'Seek playback' }).first().fill('8')
    await expect
      .poll(async () => (await state(page)).currentTime)
      .toBeGreaterThanOrEqual(8)

    await pauseButton(page).click()
    await expect.poll(async () => (await state(page)).status).toBe('paused')
    await expect(playButton(page)).toBeVisible()
  })

  test('streams the track over CMAF', async ({ page }) => {
    await open(page)
    await playButton(page).click()

    await expect.poll(async () => (await state(page)).bitrate).not.toBeNull()
    expect((await state(page)).duration).toBeCloseTo(12, 0)
  })

  test('moves through the queue by hand and when a track ends', async ({
    page,
  }) => {
    /** A playlist, not the restored single track, so there is a queue to move through. */
    await open(page, '/main/playlist/p1')
    await page
      .getByRole('button', { exact: true, name: 'Play Night Drive' })
      .click()
    await expect.poll(async () => (await state(page)).status).toBe('playing')
    const first = (await state(page)).key

    await page.getByRole('button', { name: 'Next track' }).first().click()
    await expect.poll(async () => (await state(page)).key).not.toBe(first)
    const second = (await state(page)).key
    await expect.poll(async () => (await state(page)).status).toBe('playing')

    /** Running into the next track is no pause: the button would flicker and the audio gap. */
    await page.evaluate(() => {
      const element = document.querySelector('bitrate-player[media-session]')
      Reflect.set(window, '__pauses', 0)
      element?.addEventListener('pause', () => {
        Reflect.set(
          window,
          '__pauses',
          Number(Reflect.get(window, '__pauses')) + 1,
        )
      })
    })
    await page.getByRole('slider', { name: 'Seek playback' }).first().fill('11')
    await expect
      .poll(async () => (await state(page)).key, { timeout: 15_000 })
      .not.toBe(second)
    await expect.poll(async () => (await state(page)).status).toBe('playing')
    expect(await page.evaluate(() => Reflect.get(window, '__pauses'))).toBe(0)
    await expect(pauseButton(page)).toBeVisible()
  })

  test('changes the volume from the bar', async ({ page }) => {
    await open(page)
    await playButton(page).click()

    await page.getByRole('slider', { name: 'Volume' }).first().fill('0.2')

    await expect
      .poll(async () => (await state(page)).volume)
      .toBeCloseTo(0.2, 2)
  })

  test('plays from the now-playing view', async ({ page }) => {
    await open(page)
    await page.getByRole('button', { name: 'Open full player' }).first().click()
    const dialog = page.getByRole('dialog', { name: /Now playing/ })

    await dialog.getByRole('button', { exact: true, name: 'Play' }).click()

    await expect.poll(async () => (await state(page)).status).toBe('playing')
    await expect(
      dialog.getByRole('button', { exact: true, name: 'Pause' }),
    ).toBeVisible()
  })

  test('plays from the floating window', async ({ page }) => {
    /** Document picture-in-picture is out of Playwright's reach; the popup fallback is not. */
    await page.addInitScript(() => {
      Reflect.deleteProperty(window, 'documentPictureInPicture')
    })
    await open(page)
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      page.getByRole('button', { name: 'Open floating player' }).click(),
    ])

    await popup.getByRole('button', { exact: true, name: 'Play' }).click()

    await expect.poll(async () => (await state(page)).status).toBe('playing')

    /** The layout fills the window and follows it when the window is resized. */
    const layoutHeight = () =>
      popup.evaluate(
        () =>
          document
            .querySelector('bitrate-player')
            ?.shadowRoot?.querySelector('[part="layout"]')
            ?.getBoundingClientRect().height ?? 0,
      )
    await popup.setViewportSize({ height: 480, width: 400 })
    await expect.poll(layoutHeight).toBeCloseTo(480, 0)
    await popup.setViewportSize({ height: 640, width: 520 })
    await expect.poll(layoutHeight).toBeCloseTo(640, 0)
  })
})

test.describe('phone', () => {
  test.skip(({ isMobile }) => !isMobile, 'the island is the phone layout')

  test('plays and pauses from the island', async ({ page }) => {
    await open(page)
    const island = page.getByRole('navigation', { name: 'Main navigation' })

    await island.getByRole('button', { exact: true, name: 'Play' }).click()
    await expect.poll(async () => (await state(page)).status).toBe('playing')

    await island.getByRole('button', { exact: true, name: 'Pause' }).click()
    await expect.poll(async () => (await state(page)).status).toBe('paused')
  })
})

test.describe('slow connection', () => {
  test.skip(
    ({ isMobile }) => isMobile,
    'one device class is enough for the bitrate ladder',
  )

  test('drops to the lower rendition when fragments arrive slowly', async ({
    page,
  }) => {
    /**
     * A remembered 600 kbps opens on 192 kbps; every fragment then takes ~1.5 s for its 24 KB
     * (~130 kbps), which is what adaptive bitrate measures. Only fragment responses are slowed:
     * throttling the whole page would leave `next dev` unable to load it in time, and starting
     * the throttle after load races the player, which buffers the 12 s fixture at once.
     */
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'player-throughput',
        JSON.stringify({ bps: 600_000, savedAtMs: Date.now() }),
      )
    })
    await page.route('**/api/v1/tracks/*/cmaf/*', async (route) => {
      const response = await route.fetch()
      await new Promise((resolve) => setTimeout(resolve, 1_500))
      await route.fulfill({ response })
    })
    await open(page)

    await playButton(page).click()

    await expect
      .poll(async () => (await state(page)).bitrate, { timeout: 30_000 })
      .toBe(64)
    await expect
      .poll(async () => (await state(page)).currentTime, { timeout: 30_000 })
      .toBeGreaterThan(2)
  })
})
