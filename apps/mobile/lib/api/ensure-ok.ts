import { ApiRequestError } from './api-request-error'

/** Throws an `ApiRequestError` for a non-2xx response so React Query treats it as a failure. */
export function ensureOk(response: Response, message: string): void {
  if (!response.ok) throw new ApiRequestError(message, response.status)
}
