import * as Sentry from '@sentry/nestjs'
import { nodeProfilingIntegration } from '@sentry/profiling-node'

/** The is prod value. */
const isProd = process.env.NODE_ENV === 'production'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [nodeProfilingIntegration()],
  enableLogs: true,
  tracesSampleRate: isProd ? 0.1 : 1.0,
  profileSessionSampleRate: isProd ? 0.1 : 1.0,
  profileLifecycle: 'trace',
})
