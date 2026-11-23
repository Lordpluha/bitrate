import { expect, type Page, test } from '@playwright/test'
import type { AxeResults, Result } from 'axe-core'
import { DESKTOP, openSignedIn } from '../../tests/screenshot/screenshot'

/**
 * The web-player accessibility gate (ACCESSIBILITY.md, A11Y-18): the main routes, against the
 * screenshot suite's fixture API, in every theme. axe must report no WCAG 2.2 A/AA violation,
 * contrast included. It lives in the screenshot suite for that suite's deterministic data.
 */
const AXE_SCRIPT = require.resolve('axe-core/axe.min.js')

/** The static landing, like its screenshot: the intro keeps `<main>` hidden while it plays. */
test.use({ reducedMotion: 'reduce' })

const THEMES = ['dark', 'light', 'dim'] as const
type Theme = (typeof THEMES)[number]

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

const SIGNED_OUT_ROUTES = [
  '/',
  '/auth/login',
  '/auth/registration',
  '/auth/forgot-password',
]

const SIGNED_IN_ROUTES = [
  '/main',
  '/main/library',
  '/main/search?q=luma',
  '/main/album/al1',
  '/main/artist/Luma%20Vale',
  '/main/playlist/p1',
  '/main/queue',
  '/main/notifications',
  '/main/preferences',
]

type OpenSignedOutInput = { page: Page; path: string; theme: Theme }

const openSignedOut = async ({ page, path, theme }: OpenSignedOutInput) => {
  await page.addInitScript((stored) => {
    window.localStorage.setItem('theme', JSON.stringify(stored))
  }, theme)
  await page.setViewportSize(DESKTOP)
  await page.goto(path, { waitUntil: 'networkidle' })
}

/** One line per failing node, so a failure names the rule, the element and the fix. */
const describeViolation = (violation: Result) =>
  violation.nodes.map(
    (node) =>
      `${violation.id}: ${node.target.join(' ')} ${node.html.slice(0, 160)} — ${node.failureSummary ?? ''}`,
  )

/**
 * The landing shows the app scaled down (player preview, demo panels), so its targets shrink
 * below 24px; target size there is tracked as A11Y-26, every other rule still runs.
 */
const LANDING_SKIPPED_RULES = ['target-size']

type AxeInput = { tags: string[]; skipped: string[] }

const expectNoViolations = async (page: Page, skipped: string[] = []) => {
  await expect(page.locator('main').first()).toBeVisible({ timeout: 60_000 })
  await page.addScriptTag({ path: AXE_SCRIPT })
  const results = await page.evaluate<AxeResults, AxeInput>(
    ({ tags, skipped }) =>
      window.axe.run(
        { exclude: [['nextjs-portal']] },
        {
          runOnly: { type: 'tag', values: tags },
          rules: Object.fromEntries(
            skipped.map((rule) => [rule, { enabled: false }]),
          ),
        },
      ),
    { skipped, tags: WCAG_TAGS },
  )

  expect(results.violations.flatMap(describeViolation)).toEqual([])
}

declare global {
  interface Window {
    axe: typeof import('axe-core')
  }
}

for (const theme of THEMES) {
  test.describe(`accessibility [${theme}]`, () => {
    for (const path of SIGNED_OUT_ROUTES) {
      test(`signed out ${path}`, async ({ page }) => {
        await openSignedOut({ page, path, theme })
        await expectNoViolations(
          page,
          path === '/' ? LANDING_SKIPPED_RULES : [],
        )
      })
    }

    for (const path of SIGNED_IN_ROUTES) {
      test(`signed in ${path}`, async ({ page }) => {
        await openSignedIn({ page, path, theme, viewport: DESKTOP })
        await expectNoViolations(page)
      })
    }
  })
}
