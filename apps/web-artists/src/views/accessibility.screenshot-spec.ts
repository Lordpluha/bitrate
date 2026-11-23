import { createRequire } from 'node:module'
import { expect, type Page, test } from '@playwright/test'
import { gotoHydrated } from '@tests/support/hydration'
import type { AxeResults, Result } from 'axe-core'

/**
 * The web-artists accessibility gate (ACCESSIBILITY.md, A11Y-18): the public routes the
 * screenshot suite can reach without an API, through axe. Only the landing follows the stored
 * theme outside the workspace, so it runs in every theme; the auth pages are always dark.
 */
const AXE_SCRIPT = createRequire(import.meta.url).resolve('axe-core/axe.min.js')

const THEME_STORAGE_KEY = 'bitrate.artist-theme.v1'

const THEMES = ['dark', 'light', 'dim'] as const
type Theme = (typeof THEMES)[number]

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

const DARK_ONLY_ROUTES = [
  '/login',
  '/registration',
  '/forgot-password',
  '/does-not-exist',
]

test.use({ reducedMotion: 'reduce' })

declare global {
  interface Window {
    axe: typeof import('axe-core')
  }
}

/** One line per failing node, so a failure names the rule, the element and the fix. */
const describeViolation = (violation: Result) =>
  violation.nodes.map(
    (node) =>
      `${violation.id}: ${node.target.join(' ')} ${node.html.slice(0, 160)} — ${node.failureSummary ?? ''}`,
  )

type OpenInput = { page: Page; path: string; theme: Theme }

const open = async ({ page, path, theme }: OpenInput) => {
  await page.addInitScript(
    ({ key, value }) => {
      window.localStorage.setItem(key, value)
    },
    { key: THEME_STORAGE_KEY, value: theme },
  )
  await gotoHydrated(page, path)
  await page.waitForLoadState('networkidle')
}

const expectNoViolations = async (page: Page) => {
  await page.addScriptTag({ path: AXE_SCRIPT })
  const results = await page.evaluate<AxeResults, string[]>(
    (tags) =>
      window.axe.run(document, { runOnly: { type: 'tag', values: tags } }),
    WCAG_TAGS,
  )

  expect(results.violations.flatMap(describeViolation)).toEqual([])
}

for (const theme of THEMES) {
  test(`accessibility [${theme}] landing`, async ({ page }) => {
    await open({ page, path: '/', theme })
    await expectNoViolations(page)
  })
}

for (const path of DARK_ONLY_ROUTES) {
  test(`accessibility [dark] ${path}`, async ({ page }) => {
    await open({ page, path, theme: 'dark' })
    await expectNoViolations(page)
  })
}
