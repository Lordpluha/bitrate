import { defineConfig, devices } from '@playwright/test'

/**
 * Route flows across page boundaries — what a person can actually do, not what a component
 * renders. Runs against the **dev** server on purpose: these assert behaviour, and a dev build
 * behaves the same while starting in seconds rather than after a full Nitro build.
 *
 * Deliberately separate from the screenshot config rather than a second project inside it:
 * they disagree about parallelism, retries and which server to run, and folding them together
 * means one of those settings is wrong for one of the layers.
 */
export default defineConfig({
  testDir: '../e2e',
  testMatch: '**/*.e2e-spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3002',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: 'pnpm dev',
        url: 'http://localhost:3002',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
})
