import * as Sentry from '@sentry/nextjs'
import {
  sentryDsn,
  sentryEnvironment,
  sentryTracesSampleRate,
} from './sentry.env'

Sentry.init({
  dsn: sentryDsn,
  environment: sentryEnvironment,
  tracesSampleRate: sentryTracesSampleRate,
  /** Record a tenth of sessions, and every session that produced an error. */
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  enableLogs: true,
  integrations: [Sentry.replayIntegration()],
})

/** Turns an App Router navigation into a span. */
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
