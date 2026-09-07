/**
 * Values every Sentry runtime in this app shares.
 *
 * Next.js inlines `process.env.*` at build time, and only `NEXT_PUBLIC_*` names
 * survive into the browser bundle — so the DSN has to carry that prefix to reach
 * the client, and it has to be present at *build* time, not just at runtime.
 */

/**
 * Where events are sent, or `undefined` to disable reporting entirely.
 *
 * There is deliberately no hardcoded fallback: a build with no
 * `NEXT_PUBLIC_SENTRY_DSN` reports nowhere rather than silently adopting some
 * other project's DSN. The SDK treats an undefined DSN as "disabled", so a
 * developer machine with no `.env` still runs normally.
 */
export const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN

/**
 * Deploy target this build belongs to.
 *
 * Mirrors `apps/api/src/instrument.ts`: the deploy workflow sets the environment
 * from the GitHub Environment it deployed, so it is authoritative and
 * independent of `NODE_ENV` being right. 'development' matches the default in
 * `apps/web-player/env.schema.ts`; Next.js sets `NODE_ENV` itself before any of
 * this runs, so the last fallback only covers a non-Next entry point.
 */
export const sentryEnvironment =
  process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ||
  process.env.SENTRY_ENVIRONMENT ||
  process.env.NODE_ENV ||
  'development'

/** True only for the production deploy target, not merely for `NODE_ENV`. */
const isProductionTarget = sentryEnvironment === 'production'

/** Full sampling everywhere but production, where 10% keeps the quota usable. */
export const sentryTracesSampleRate = isProductionTarget ? 0.1 : 1.0
