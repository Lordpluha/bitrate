import { defineConfig } from 'vitest/config'
import { sharedConfig } from './vitest.shared.ts'

/** One component, hook or schema at a time, with everything around it mocked. */
export default defineConfig({
  ...sharedConfig,
  test: {
    name: 'unit',
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['src/**/*.unit-spec.{ts,tsx}'],
  },
})
