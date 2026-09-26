import { defineConfig } from 'vitest/config'
import { sharedConfig } from './vitest.shared.ts'

/**
 * Several units composed — a form with its schema and its submit path, a hook against a real
 * store. Still jsdom, still no network: the timeout is longer because composition is slower,
 * not because anything here is allowed to wait on a server.
 */
export default defineConfig({
  ...sharedConfig,
  test: {
    name: 'integration',
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['src/**/*.int-spec.{ts,tsx}'],
    testTimeout: 30_000,
  },
})
