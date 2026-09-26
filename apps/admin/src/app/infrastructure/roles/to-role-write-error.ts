import { HttpErrorResponse } from '@angular/common/http'
import { RoleWriteError } from '@domain/role'

/** Which write the failing request was, since 409 means something different for each one. */
type RoleWriteOperation = 'create' | 'update' | 'delete'

/**
 * Maps a failed create/update/delete response onto `RoleWriteError`. This is the only place
 * that ever reads a status code for a role write — presentation only ever sees the `reason`.
 *
 * A 400 covers two distinct API refusals (an unknown/protected permission, or a built-in-role
 * edit that is not allowed) that the response body does not distinguish, so both map to
 * `'not-allowed'`; the editor already knows whether the role in front of it is built-in and
 * picks the right sentence from that.
 */
export function toRoleWriteError(error: unknown, operation: RoleWriteOperation): RoleWriteError {
  if (!(error instanceof HttpErrorResponse)) return new RoleWriteError('unknown')

  switch (error.status) {
    case 400:
      return new RoleWriteError('not-allowed')
    case 404:
      return new RoleWriteError('not-found')
    case 409:
      return new RoleWriteError(operation === 'delete' ? 'in-use' : 'duplicate-name')
    default:
      return new RoleWriteError('unknown')
  }
}
