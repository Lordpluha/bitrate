import { resolve } from 'node:path'
import { defineConfig } from '@playwright/test'
import config from './playwright.e2e.config'

const production = process.env.DASHBOARD_TEST_PRODUCTION === '1'

/** Dedicated API fixture exercises SSR, redirects and cookies without a real account or database. */
export default defineConfig({
  ...config,
  testMatch: '**/dashboard.e2e-spec.ts',
  /** The general config ignores this spec; this config is the one that runs it. */
  testIgnore: [],
  workers: 1,
  use: { ...config.use, baseURL: 'http://localhost:3102' },
  webServer: [
    {
      command: 'node tests/support/artist-api.mjs',
      cwd: resolve(import.meta.dirname, '../..'),
      url: 'http://127.0.0.1:3103/health',
      reuseExistingServer: false,
    },
    {
      command: production
        ? 'node .output/server/index.mjs'
        : 'pnpm exec vite dev --config tests/configs/vite.dashboard.config.ts --port 3102 --strictPort',
      cwd: resolve(import.meta.dirname, '../..'),
      url: 'http://localhost:3102/login',
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
