import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: '../../src',
  testMatch: '**/*.screenshot-spec.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'github' : 'list',
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      /**
       * 0.02 allowed 18k differing pixels on a 1280x720 shot — 18x the area of the header logo,
       * so replacing the logo outright passed this gate silently. Consecutive runs here are
       * byte-identical (verified down to a ratio of 0), and this value still leaves ~370px of
       * headroom for antialiasing while failing on anything logo-sized or larger. A renderer
       * change on CI shows up as a real diff to regenerate, not as a silent pass.
       */
      maxDiffPixelRatio: 0.0004,
    },
  },
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3001',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: 'pnpm dev',
        url: 'http://localhost:3001',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
})
