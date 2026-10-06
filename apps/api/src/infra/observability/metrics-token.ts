import { timingSafeEqual } from 'node:crypto'

/** Outcome of checking a request's `Authorization` header against the configured metrics token. */
export type MetricsAccess = 'granted' | 'disabled' | 'denied'

/**
 * Decides whether a scrape may read metrics. Shared by the API's `GET /metrics` and the transcode
 * worker's listener so both use one bearer scheme. No token configured means the endpoint is
 * switched off (`disabled`), not open.
 */
export function checkMetricsAccess(
  expected: string | undefined,
  authorization: string | undefined,
): MetricsAccess {
  if (!expected) return 'disabled'

  const supplied = authorization?.startsWith('Bearer ') ? authorization.slice(7) : ''
  const expectedBuffer = Buffer.from(expected)
  const suppliedBuffer = Buffer.from(supplied)
  const matches =
    expectedBuffer.length === suppliedBuffer.length &&
    timingSafeEqual(expectedBuffer, suppliedBuffer)

  return matches ? 'granted' : 'denied'
}
