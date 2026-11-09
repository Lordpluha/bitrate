#!/usr/bin/env node
/**
 * Captures the real player for the landing's interactive device previews: a few screens on a
 * desktop and on a phone, in each theme, from the fixture API the screenshot specs use, plus
 * where each screen's navigation controls sit, so the landing can make them clickable. Run it
 * whenever the player's look or navigation changes, so the landing never shows a player that no
 * longer exists.
 *
 * Needs the fixture API and the app running against it (as `playwright.screenshot.config.ts`
 * starts them):
 *   MOCK_API_PORT=3999 node tests/screenshot/mock-api.mjs
 *   API_URL=http://localhost:3999 NEXT_PUBLIC_API_URL=http://localhost:3999 pnpm dev
 *   node scripts/capture-landing-previews.mjs
 *
 * Writes `public/images/landing/player-<device>-<screen>-<theme>.webp` and
 * `src/views/LandingView/model/playerScreens.generated.ts`.
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'
import sharp from 'sharp'

const APP = process.env.BASE_URL ?? 'http://localhost:3001'
const OUT = new URL('../public/images/landing/', import.meta.url)
const MAP = new URL(
  '../src/views/LandingView/model/playerScreens.generated.ts',
  import.meta.url,
)
/** The fixture clock: greetings and relative dates match the screenshot baselines. */
const NOW = new Date('2026-10-19T12:00:00.000Z')
const OVERLAYS = readFileSync(
  new URL('../tests/configs/screenshot-overlays.css', import.meta.url),
  'utf8',
)
const THEMES = ['dark', 'light', 'dim']

/** The visible copy of a control: sidebar links come first, player-bar controls last. */
const shown = (locator) => locator.filter({ visible: true })
const link = (name) => (page) =>
  shown(page.getByRole('link', { name, exact: true })).first()
const barLink = (name) => (page) =>
  shown(page.getByRole('link', { name, exact: true })).last()
const button = (name) => (page) =>
  shown(page.getByRole('button', { name })).last()

/** Opens the expanded now-playing view the way a listener does on each layout. */
const openNowPlaying = {
  desktop: async (page) => {
    await page.getByRole('button', { name: 'Open full player' }).first().click()
    await page
      .getByRole('dialog', { name: 'Now playing Afterglow' })
      .waitFor({ timeout: 60_000 })
  },
  mobile: async (page) => {
    /* `next dev`'s indicator can sit over the island; dispatch instead of a pointer click */
    await page
      .getByRole('button', { name: 'Open now playing: Afterglow' })
      .dispatchEvent('click')
    await page
      .getByRole('dialog', { name: 'Now playing Afterglow' })
      .waitFor({ timeout: 60_000 })
  },
}

/** Sidebar and player-bar controls shared by the desktop screens. */
const DESKTOP_NAV = [
  { to: 'home', find: link('Home') },
  { to: 'search', find: link('Search') },
  { to: 'charts', find: link('Charts') },
  { to: 'recents', find: link('Recents') },
  { to: 'queue', find: barLink('Open queue') },
  { to: 'now', find: button('Open full player') },
]
/** The mobile island. */
const MOBILE_NAV = [
  { to: 'home', find: link('Home') },
  { to: 'search', find: link('Search') },
  { to: 'library', find: link('Library') },
  { to: 'now', find: button('Open now playing: Afterglow') },
]
const NOW_BACK = { to: 'home', find: button('Minimize now playing') }

const DEVICES = [
  {
    name: 'desktop',
    viewport: { width: 1440, height: 900 },
    scale: 1,
    width: 1440,
    screens: [
      { id: 'home', path: '/main', nav: DESKTOP_NAV },
      { id: 'search', path: '/main/search', nav: DESKTOP_NAV },
      { id: 'charts', path: '/main/charts', nav: DESKTOP_NAV },
      { id: 'recents', path: '/main/recents', nav: DESKTOP_NAV },
      { id: 'queue', path: '/main/queue', nav: DESKTOP_NAV },
      {
        id: 'now',
        path: '/main',
        open: openNowPlaying.desktop,
        nav: [NOW_BACK, { to: 'queue', find: barLink('Open queue') }],
      },
    ],
  },
  {
    name: 'mobile',
    viewport: { width: 390, height: 844 },
    /* phones are drawn small on the landing: twice the pixels keep the text crisp */
    scale: 2,
    width: 780,
    screens: [
      { id: 'home', path: '/main', nav: MOBILE_NAV },
      { id: 'search', path: '/main/search', nav: MOBILE_NAV },
      { id: 'library', path: '/main/library', nav: MOBILE_NAV },
      {
        id: 'now',
        path: '/main',
        open: openNowPlaying.mobile,
        nav: [NOW_BACK],
      },
    ],
  },
]

/** Each screen's clickable controls as shares of the viewport (0–1), from the dark capture. */
const map = {}

mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch()
try {
  for (const device of DEVICES) {
    map[device.name] = {}
    for (const screen of device.screens) {
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
        await page.goto(`${APP}${screen.path}`, {
          waitUntil: 'networkidle',
          timeout: 180_000,
        })
        await page.locator('main').first().waitFor({ timeout: 90_000 })
        await page.addStyleTag({ content: OVERLAYS })
        if (screen.open) await screen.open(page)
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(800)
        if (theme === 'dark') {
          const spots = []
          for (const { to, find } of screen.nav) {
            if (to === screen.id) continue
            const box = await find(page)
              .boundingBox({ timeout: 2000 })
              .catch(() => null)
            if (!box) continue
            const { width, height } = device.viewport
            spots.push({
              to,
              x: +(box.x / width).toFixed(4),
              y: +(box.y / height).toFixed(4),
              w: +(box.width / width).toFixed(4),
              h: +(box.height / height).toFixed(4),
            })
          }
          map[device.name][screen.id] = spots
        }
        for (const name of screen.hide ?? [])
          await page.getByRole('button', { name }).evaluateAll((els) => {
            for (const el of els) el.style.visibility = 'hidden'
          })
        const png = await page.screenshot({
          animations: 'disabled',
          caret: 'hide',
        })
        const file = new URL(
          `player-${device.name}-${screen.id}-${theme}.webp`,
          OUT,
        )
        await sharp(png)
          .resize({ width: device.width })
          .webp({ quality: 80 })
          .toFile(fileURLToPath(file))
        console.log(`wrote ${fileURLToPath(file)}`)
        await context.close()
      }
    }
  }
} finally {
  await browser.close()
}

const source = `/* Generated by scripts/capture-landing-previews.mjs — do not edit by hand. */

/** Where each captured player screen's navigation controls sit, as shares of the screen (0–1). */
export const PLAYER_SCREENS = ${JSON.stringify(map, null, 2)} as const
`
writeFileSync(MAP, source)
execFileSync('pnpm', ['exec', 'biome', 'format', '--write', fileURLToPath(MAP)])
console.log(`wrote ${fileURLToPath(MAP)}`)
