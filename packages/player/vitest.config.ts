import { svelte } from '@sveltejs/vite-plugin-svelte'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'
import { cappedCmafFixture } from './scripts/capped-cmaf-fixture.mjs'

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
            /**
             * Media specs call `play()` without a user gesture, which Chromium's autoplay
             * policy rejects in the test iframe even when muted; real hosts start playback
             * from a click.
             */
            provider: playwright({
              launchOptions: { args: ['--autoplay-policy=no-user-gesture-required'] },
            }),
            screenshotFailures: false,
            instances: [{ browser: 'chromium' }],
          },
        },
      },
      {
        /**
         * A plain `<audio>` against the API's exact-or-paced range rule (ADR-0067), in the
         * engines that play without MSE in production. WebKit takes no Chromium flag; it allows
         * muted playback without a gesture.
         */
        plugins: [
          cappedCmafFixture({
            fixtureDir: new URL('./src/element/__fixtures__/cmaf/', import.meta.url),
          }),
        ],
        test: {
          name: 'native',
          globals: true,
          fileParallelism: false,
          include: ['src/**/*.native-spec.ts'],
          browser: {
            enabled: true,
            screenshotFailures: false,
            instances: [
              {
                browser: 'chromium',
                provider: playwright({
                  launchOptions: { args: ['--autoplay-policy=no-user-gesture-required'] },
                }),
              },
              { browser: 'webkit', provider: playwright() },
            ],
          },
        },
      },
    ],
  },
})
