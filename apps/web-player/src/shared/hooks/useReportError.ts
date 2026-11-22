'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

/** Input for {@link useReportError}. */
export type UseReportErrorInput = {
  /** The error the boundary received; `digest` is set for errors thrown on the server. */
  error: Error & { digest?: string }
}

/**
 * Sends an error an App Router `error.tsx` boundary caught to Sentry, once per error.
 *
 * Server render errors already reach Sentry through `onRequestError`, but a client render error
 * that a segment boundary catches is handled — React never reports it as uncaught — so without
 * this it would only ever reach Sentry from `global-error.tsx`.
 */
export function useReportError({ error }: UseReportErrorInput) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])
}
