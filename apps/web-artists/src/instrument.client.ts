import * as Sentry from '@sentry/tanstackstart-react'

/**
 * Browser-side Sentry. `src/client.tsx` imports this before anything else, so errors thrown while
 * the app hydrates are already captured.
 *
 * Vite inlines `import.meta.env.VITE_*` at build time, so the DSN has to be present when the image
 * is built, not when it starts. There is deliberately no hardcoded fallback: without
 * `VITE_SENTRY_DSN` the SDK starts disabled, so a developer machine with no `.env` reports nowhere
 * rather than into the production project.
 *
 * The release is injected by the `sentryTanstackStart` Vite plugin from `SENTRY_RELEASE` at build
 * time, the same value the uploaded source maps are attached to.
 */

/**
 * Deploy target this build belongs to. CI sets it explicitly; otherwise Vite's mode, which is
 * `production` for `vite build` and `development` for `vite dev`.
 */
const environment =
  import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE

/** Full sampling everywhere but production, where 10% keeps the quota usable. */
const isProductionTarget = environment === 'production'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment,
  /**
   * Send events to this app's own origin rather than *.sentry.io, so ad-blockers do not drop
   * them. `serveTunnelIntegration()` in `instrument.server.mjs` answers that path and forwards
   * envelopes for this project's DSN only.
   */
  tunnel: true,
  /** Logs (`Sentry.logger`) are on by default in SDK v11; there is no `enableLogs` to set. */
  tracesSampleRate: isProductionTarget ? 0.1 : 1.0,
  /**
   * Record a tenth of sessions, and every session that produced an error. The replay defaults
   * mask all text and inputs and block media, which is what the privacy policy promises.
   */
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [Sentry.replayIntegration()],
})
