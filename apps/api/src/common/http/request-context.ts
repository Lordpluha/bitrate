import type { Request } from 'express'

export const REQUEST_ID_HEADER = 'X-Request-ID'

export type RequestWithContext = Request & {
  requestId?: string
}

/** Returns the server-validated correlation ID attached by RequestIdMiddleware. */
export const getRequestId = (request: Request): string | undefined =>
  (request as RequestWithContext).requestId
