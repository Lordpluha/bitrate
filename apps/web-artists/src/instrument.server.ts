import * as Sentry from '@sentry/tanstackstart-react'

/**
 * Server-side Sentry for the SSR server, imported first by `src/server.ts`.
 *
 * The `sentryTanstackStart` Vite plugin can load this file by itself only for `nitro/vite`
 * (Nitro v3). This app builds with `@tanstack/nitro-v2-vite-plugin`, so it follows Sentry's
 * "without Nitro" setup: the server entry imports it before anything else. The same import also
 * runs under `vite dev`, so there is a single initialisation path in every mode.
 *
 * The DSN and environment prefer the runtime values the Dockerfile sets and fall back to the
 * build-time `VITE_*` ones, which also makes a local `.env` work in development. Unset, the SDK
 * starts disabled.
 */

/** Deploy target; CI sets it explicitly, NODE_ENV is only the fallback. */
const environment =
  process.env.SENTRY_ENVIRONMENT ||
  import.meta.env.VITE_SENTRY_ENVIRONMENT ||
  process.env.NODE_ENV ||
  'development'

/** Full sampling everywhere but production, where 10% keeps the quota usable. */
const isProductionTarget = environment === 'production'

Sentry.init({
  dsn: process.env.SENTRY_DSN || import.meta.env.VITE_SENTRY_DSN || undefined,
  environment,
  /**
   * The release the source maps were uploaded under. The Vite plugin hands it to the browser
   * through a meta tag, but injects it into the server only for Nitro v3, so it is read here.
   */
  release: process.env.SENTRY_RELEASE || undefined,
  /** Logs (`Sentry.logger`) are on by default in SDK v11; there is no `enableLogs` to set. */
  tracesSampleRate: isProductionTarget ? 0.1 : 1.0,
  /**
   * Answers the browser SDK's `tunnel: true` requests on this origin and forwards them to
   * Sentry, so ad-blockers cannot drop client events. Only envelopes for this server's own DSN
   * are forwarded, so the endpoint cannot be used as an open relay.
   */
  integrations: [Sentry.serveTunnelIntegration()],
})
