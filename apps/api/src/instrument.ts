import * as Sentry from '@sentry/nestjs'
import { nodeProfilingIntegration } from '@sentry/profiling-node'

/**
 * Deploy target this process belongs to.
 *
 * SENTRY_ENVIRONMENT is set by the deploy workflow from the name of the GitHub
 * Environment it deployed, so it is authoritative and independent of NODE_ENV
 * being correct. NODE_ENV is only the fallback for a container started outside
 * that path, and 'local' matches the default in apps/api/env.schema.ts.
 *
 * Read from process.env rather than the validated config because this module is
 * imported before the Nest application, and therefore before ConfigModule, exists.
 */
const environment = process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'local'

/**
 * Released version this image was built from, as `bitrate-api@<version>`.
 *
 * Written by the deploy workflow from `apps/api/package.json` at the commit
 * being deployed, which is always a `chore(release): version packages` commit —
 * so the identifier names a release rather than an arbitrary build. Undefined
 * when unset, which leaves the event unattributed rather than attributing it to
 * an empty release.
 *
 * Forward slashes are not legal in a Sentry release name, which is why this is
 * not the workspace name `@bitrate/api`.
 */
const release = process.env.SENTRY_RELEASE || undefined

/** True only for the production deploy target, not merely for NODE_ENV. */
const isProd = environment === 'production'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment,
  release,
  integrations: [nodeProfilingIntegration()],
  enableLogs: true,
  tracesSampleRate: isProd ? 0.1 : 1.0,
  profileSessionSampleRate: isProd ? 0.1 : 1.0,
  profileLifecycle: 'trace',
})
