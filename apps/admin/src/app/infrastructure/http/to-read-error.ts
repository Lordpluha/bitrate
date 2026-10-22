import { HttpErrorResponse } from '@angular/common/http'
import { ResourceNotFoundError } from '@domain/shared'

/**
 * Maps a failed `getById` read: a 404 becomes `ResourceNotFoundError`, anything else is
 * rethrown as-is so presentation reports it as a load failure rather than "not found".
 */
export function toReadError(error: unknown): unknown {
  if (error instanceof HttpErrorResponse && error.status === 404) return new ResourceNotFoundError()
  return error
}
