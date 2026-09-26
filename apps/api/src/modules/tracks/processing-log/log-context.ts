/** The correlation keys every processing-log line and Sentry tag set share. */
export type ProcessingLogContext = {
  trackId?: string
  jobId?: string
  attempt?: number
  step?: string | null
  errorCode?: string | null
}

/**
 * A fixed JSON suffix for a Nest `Logger` line, so `docker logs | grep jobId` and Sentry
 * tags read the same keys. `jobId` is the correlation id (stable across retries);
 * `trackId` is the second axis.
 */
export function processingLogSuffix(context: ProcessingLogContext): string {
  return JSON.stringify({
    trackId: context.trackId ?? null,
    jobId: context.jobId ?? null,
    attempt: context.attempt ?? null,
    step: context.step ?? null,
    errorCode: context.errorCode ?? null,
  })
}
