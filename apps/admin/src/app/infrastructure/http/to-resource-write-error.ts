import { HttpErrorResponse } from '@angular/common/http'
import { ResourceWriteError } from '@domain/shared'

/** Which write the failing request was — a 409 means something different for each. */
type ResourceWriteOperation = 'deactivate' | 'restore'

/**
 * Maps a failed deactivate/restore write onto `ResourceWriteError`. This is the only place that
 * ever reads a status code for these writes — presentation only ever sees the `reason`.
 */
export function toResourceWriteError(
  error: unknown,
  operation: ResourceWriteOperation,
): ResourceWriteError {
  if (!(error instanceof HttpErrorResponse)) return new ResourceWriteError('unknown')

  switch (error.status) {
    case 404:
      return new ResourceWriteError('not-found')
    case 409:
      return new ResourceWriteError(
        operation === 'deactivate' ? 'already-deactivated' : 'not-deactivated',
      )
    default:
      return new ResourceWriteError('unknown')
  }
}
