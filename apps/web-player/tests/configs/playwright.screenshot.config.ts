import { defineConfig, devices } from '@playwright/test'

/** Where `tests/screenshot/mock-api.mjs` answers; the specs' fixture data lives there. */
const MOCK_API_PORT = 3999
const MOCK_API_URL = `http://localhost:${MOCK_API_PORT}`

export default defineConfig({
  testDir: '../../src',
  testMatch: '**/*.screenshot-spec.ts',
  fullyParallel: false,
  /**
   * Not redundant next to `fullyParallel: false`: that flag only serialises tests *within* a
   * file, while separate spec files still race across workers for the one dev server.
   */
  workers: 1,
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
      /** Hides the dev-server overlays so a baseline from `next start` matches `next dev`. */
      stylePath: './screenshot-overlays.css',
    },
  },
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3001',
    /** Greetings and dates follow the browser's zone and locale; pin both like CI's. */
    locale: 'en-US',
    timezoneId: 'UTC',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  /**
   * The app talks to the fixture API in `tests/screenshot/mock-api.mjs`, from the browser and
   * from server components alike, so every page renders the same data on every run. Neither
   * server is reused: a `pnpm dev` already on :3001 talks to a real API, so stop it before
   * running these locally.
   */
  webServer: process.env.BASE_URL
    ? undefined
    : [
        {
          command: `node tests/screenshot/mock-api.mjs`,
          env: { MOCK_API_PORT: String(MOCK_API_PORT) },
          url: `${MOCK_API_URL}/api/v1/auth/me`,
          reuseExistingServer: false,
          timeout: 30_000,
        },
        {
          command: 'pnpm dev',
          env: { API_URL: MOCK_API_URL, NEXT_PUBLIC_API_URL: MOCK_API_URL },
          url: 'http://localhost:3001',
          reuseExistingServer: false,
          timeout: 180_000,
        },
      ],
})
