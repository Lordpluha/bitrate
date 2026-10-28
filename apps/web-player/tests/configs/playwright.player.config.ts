import { resolve } from 'node:path'
import { defineConfig, devices } from '@playwright/test'

/**
 * The player regression suite (#240): real playback through `<bitrate-player>` against the
 * fixture API, which streams the CMAF fixture of `@bitrate/player` for every track
 * (`MOCK_CMAF=1`). Same servers as the screenshot suite, so stop a local `pnpm dev` first.
 */
const MOCK_API_PORT = 3999
const MOCK_API_URL = `http://localhost:${MOCK_API_PORT}`
const APP_ROOT = resolve(__dirname, '../..')

export default defineConfig({
  testDir: '../../src',
  testMatch: '**/*.player-spec.ts',
  /** One dev server and one mock: run files one at a time. */
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  timeout: 60_000,
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3001',
    locale: 'en-US',
    timezoneId: 'UTC',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 5'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : [
        {
          command: 'node tests/screenshot/mock-api.mjs',
          cwd: APP_ROOT,
          env: { MOCK_API_PORT: String(MOCK_API_PORT), MOCK_CMAF: '1' },
          url: `${MOCK_API_URL}/api/v1/auth/me`,
          reuseExistingServer: false,
          timeout: 30_000,
        },
        {
          command: 'pnpm dev',
          cwd: APP_ROOT,
          env: { API_URL: MOCK_API_URL, NEXT_PUBLIC_API_URL: MOCK_API_URL },
          url: 'http://localhost:3001',
          reuseExistingServer: false,
          timeout: 180_000,
        },
      ],
})
