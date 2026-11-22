// Sentry first, before anything else is imported, so errors thrown during hydration are captured.
import './instrument.client'

import * as Sentry from '@sentry/tanstackstart-react'
import { isNotFound, isRedirect } from '@tanstack/react-router'
import { StartClient } from '@tanstack/react-start/client'
import { type ErrorInfo, StrictMode, startTransition } from 'react'
import { hydrateRoot } from 'react-dom/client'

/** React's handler signature for errors an error boundary caught. */
type CaughtErrorHandler = (error: unknown, errorInfo: ErrorInfo) => void

const reportToSentry = Sentry.reactErrorHandler()

/**
 * Reports every error a boundary caught — TanStack Router's route boundaries included. The router
 * has no router-wide `onError`, and its global boundary reports nothing in production, so without
 * this a loader or render error that ends in an error component never reaches Sentry.
 *
 * `notFound()` and `redirect()` are thrown as control flow, not failures, so they are skipped.
 */
const reportCaughtError: CaughtErrorHandler = (error, errorInfo) => {
  if (isNotFound(error) || isRedirect(error)) return
  reportToSentry(error, errorInfo)
}

/** Start's default client entry, plus React's error hooks wired to Sentry. */
startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <StartClient />
    </StrictMode>,
    {
      onCaughtError: reportCaughtError,
      onUncaughtError: reportToSentry,
      onRecoverableError: reportToSentry,
    },
  )
})
