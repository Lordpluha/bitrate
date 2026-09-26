import { defineConfig, devices } from '@playwright/test'

/**
 * Visual baselines, and the one rule that makes them worth having: **they run against the
 * production build, not the dev server.**
 *
 * A dev server paints things a visitor never sees. The web player's baselines were captured
 * against `pnpm dev` and carry the Next.js dev-tools badge and the react-query devtools button
 * baked into the corners of every reference image, which means a devtools version bump breaks
 * unrelated visual tests and the baseline does not show what ships. That costs a build per run
 * here, and it is worth it.
 *
 * `workers: 1` is not redundant next to `fullyParallel: false`: that flag only serialises tests
 * *within* a file, while separate files still race across workers for the same server.
 */
export default defineConfig({
  testDir: '../../src',
  testMatch: '**/*.screenshot-spec.ts',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  /** No retries: a visual diff that passes on the second run is a flake being hidden. */
  retries: 0,
  reporter: process.env.CI ? 'github' : 'list',
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      /**
       * Matches the web player's threshold, chosen there against a measured baseline: enough
       * headroom for antialiasing, tight enough that a logo-sized change still fails.
       */
      maxDiffPixelRatio: 0.0004,
    },
  },
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3002',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: 'pnpm build && pnpm start',
        url: 'http://localhost:3002',
        reuseExistingServer: !process.env.CI,
        timeout: 240_000,
      },
})
