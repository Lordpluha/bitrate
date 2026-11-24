import { ApiRequestError } from './api-request-error'

/** Statuses a retry cannot fix: the session, the permission or the rate limit decide them. */
const FINAL_STATUSES = new Set([400, 401, 403, 404, 422, 429])
const MAX_RETRIES = 2

/** React Query `retry` policy: retry network and server failures twice, never client errors. */
export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiRequestError && FINAL_STATUSES.has(error.status)) return false
  return failureCount < MAX_RETRIES
}
