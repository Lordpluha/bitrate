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
  /** Attach local variable values to server stack frames. */
  includeLocalVariables: true,
  enableLogs: true,
})
