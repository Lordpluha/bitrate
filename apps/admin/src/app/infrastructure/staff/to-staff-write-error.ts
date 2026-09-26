import { HttpErrorResponse } from '@angular/common/http'
import { StaffWriteError } from '@domain/staff'

/** Which write the failing request was, since a status code means something different for each. */
type StaffWriteOperation = 'create' | 'assign-role' | 'update-permissions' | 'deactivate'

/**
 * Maps a failed staff write onto `StaffWriteError`. This is the only place that ever reads a
 * status code for a staff write — presentation only ever sees the `reason`.
 *
 * A 400 on `update-permissions` covers two distinct API refusals (an unknown/protected
 * permission, or the target holding the built-in ADMIN role) that the response body does not
 * distinguish, so it maps to the shared `'not-allowed'`; the detail page already knows whether
 * the operator in front of it is a built-in ADMIN holder and picks the right sentence from
 * that. `create` and `assign-role` only ever refuse a 400 for the permission reason, so they
 * map to the more specific `'unknown-permission'`.
 */
export function toStaffWriteError(error: unknown, operation: StaffWriteOperation): StaffWriteError {
  if (!(error instanceof HttpErrorResponse)) return new StaffWriteError('unknown')

  switch (error.status) {
    case 400:
      return new StaffWriteError(
        operation === 'update-permissions' ? 'not-allowed' : 'unknown-permission',
      )
    case 404:
      return new StaffWriteError('not-found')
    case 409:
      return new StaffWriteError(operation === 'create' ? 'conflict' : 'last-admin')
    default:
      return new StaffWriteError('unknown')
  }
}
