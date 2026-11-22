import { sentryTanstackStart } from '@sentry/tanstackstart-react/vite'
import tailwindcss from '@tailwindcss/vite'
import { nitroV2Plugin } from '@tanstack/nitro-v2-vite-plugin'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { assertDeployEnv } from './env.schema'

/**
 * Refuses a deployable build that would ship the source's localhost fallbacks. The Dockerfile
 * that builds the image sets ENFORCE_DEPLOY_ENV; lint, typecheck, tests and local builds do not,
 * and legitimately have no public origin. `config.env` is what Vite inlines into the bundle,
 * `.env` files and shell values already merged in Vite's own precedence.
 */
const enforceDeployEnv = (): Plugin => ({
  name: 'bitrate-enforce-deploy-env',
  apply: 'build',
  configResolved(config) {
    if (process.env.ENFORCE_DEPLOY_ENV)
      assertDeployEnv({ environment: config.env })
  },
})

export default defineConfig({
  server: {
    port: 3002,
    /**
     * `next dev` bound 0.0.0.0 by default; Vite binds localhost, which makes the dev container
     * in docker-compose.dev.yaml unreachable from the host. Keep this.
     */
    host: true,
  },
  resolve: {
    /** Vite 8 reads the `paths` map from tsconfig.json directly — no vite-tsconfig-paths needed. */
    tsconfigPaths: true,
  },
  plugins: [
    enforceDeployEnv(),
    tailwindcss(),
    tanstackStart(),
    /**
     * Without Nitro, `vite build` emits dist/client + dist/server, and dist/server/server.js is
     * a fetch handler that exits immediately under `node` — there is nothing to deploy. Nitro
     * wraps it into the self-contained .output/server/index.mjs the Dockerfile runs.
     */
    nitroV2Plugin({
      /**
       * Without a date Nitro warns and falls back to 2024-04-03. Pinning that same date keeps
       * the preset behaviour the server already ships with; moving it forward is a deliberate
       * upgrade, not a side effect of silencing the warning.
       */
      compatibilityDate: '2024-04-03',
      externals: {
        /**
         * lucide-react's exports list a `node` condition (CJS) ahead of `import`. Nitro traces
         * only the ESM build into .output, so Node then fails to find the CJS entry at runtime.
         * Bundling it sidesteps the mismatch.
         */
        inline: ['lucide-react'],
      },
    }),
    /** react's vite plugin must come after start's vite plugin. */
    viteReact(),
    /**
     * Last, as Sentry requires. Uploads source maps when SENTRY_AUTH_TOKEN is set at build time
     * (absent, the build just skips it), names the release from SENTRY_RELEASE, instruments the
     * middlewares in src/start.ts and adds the release meta tag the browser SDK reads. Server init
     * is imported by src/server.ts: the plugin's automatic loading needs Nitro v3, not nitro-v2.
     */
    sentryTanstackStart({
      org: 'bitrate-1l',
      project: 'artists',
      authToken: process.env.SENTRY_AUTH_TOKEN,
      silent: !process.env.CI,
    }),
  ],
})
