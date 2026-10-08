import { resolve } from 'node:path'
import { defineConfig, devices } from '@playwright/test'

/**
 * Route flows across page boundaries — what a person can actually do, not what a component
 * renders. Runs against the **dev** server on purpose: these assert behaviour, and a dev build
 * behaves the same while starting in seconds rather than after a full Nitro build.
 *
 * Deliberately separate from the screenshot config rather than a second project inside it:
 * they disagree about parallelism, retries and which server to run, and folding them together
 * means one of those settings is wrong for one of the layers.
 *
 * One run covers both suites:
 * - the general flows (`chromium`, `mobile-chrome`) against the app's own dev server on 3002;
 * - the dashboard suite (`dashboard-*`) against a second Vite server on 3102 that talks to the
 *   deterministic API fixture on 3103, so it needs neither a database nor a real account.
 */
const appRoot = resolve(import.meta.dirname, '../..')
const dashboardSpec = '**/dashboard.e2e-spec.ts'
const dashboardBaseURL = 'http://localhost:3102'
/** Exercise the built Nitro server instead of Vite dev (build with VITE_API_URL=http://localhost:3103 first). */
const dashboardProduction = process.env.DASHBOARD_TEST_PRODUCTION === '1'

export default defineConfig({
  testDir: '../e2e',
  testMatch: '**/*.e2e-spec.ts',
  fullyParallel: true,
  /**
   * The fixture namespaces its in-memory state per test (the `e2e_scope` cookie set in the
   * dashboard spec), so every project runs fully parallel. Playwright defaults to half the
   * cores; a hosted runner has 4 and the tests mostly wait on the browser, so use them all.
   */
  workers: process.env.CI ? 4 : undefined,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3002',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: dashboardSpec,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      testIgnore: dashboardSpec,
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'dashboard-chromium',
      testMatch: dashboardSpec,
      use: { ...devices['Desktop Chrome'], baseURL: dashboardBaseURL },
    },
    {
      name: 'dashboard-mobile-chrome',
      testMatch: dashboardSpec,
      use: { ...devices['Pixel 5'], baseURL: dashboardBaseURL },
    },
  ],
  webServer: [
    ...(process.env.BASE_URL
      ? []
      : [
          {
            command: 'pnpm dev',
            url: 'http://localhost:3002',
            reuseExistingServer: !process.env.CI,
            timeout: 120_000,
          },
        ]),
    {
      command: 'node tests/support/artist-api.mjs',
      cwd: appRoot,
      url: 'http://127.0.0.1:3103/health',
      reuseExistingServer: false,
    },
    {
      command: dashboardProduction
        ? 'node .output/server/index.mjs'
        : 'pnpm exec vite dev --config tests/configs/vite.dashboard.config.ts --port 3102 --strictPort',
      cwd: appRoot,
      url: `${dashboardBaseURL}/login`,
      env: {
        PORT: '3102',
        VITE_API_URL: 'http://localhost:3103',
        API_URL: 'http://127.0.0.1:3103',
      },
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
})
