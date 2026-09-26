import { svelte } from '@sveltejs/vite-plugin-svelte'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          environment: 'jsdom',
          globals: true,
          include: ['src/**/*.unit-spec.ts'],
        },
      },
      {
        /**
         * A true server environment — no DOM, no `customElements` — unlike `unit` (jsdom,
         * which partially implements custom elements). Proves the package is safe to import
         * from a server bundle (Next.js, Nitro) the way `unit` cannot.
         */
        test: {
          name: 'node',
          environment: 'node',
          globals: true,
          include: ['src/**/*.node-spec.ts'],
        },
      },
      {
        /**
         * No `compilerOptions` here — `svelte()` auto-loads `svelte.config.js`, the single
         * source of `{ runes: true, customElement: true }` for this package.
         */
        plugins: [svelte()],
        test: {
          name: 'browser',
          globals: true,
          fileParallelism: false,
          include: ['src/**/*.browser-spec.ts'],
          browser: {
            enabled: true,
            provider: playwright(),
            screenshotFailures: false,
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
})
