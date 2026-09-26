import { ForbiddenException } from '@nestjs/common'
import type { Permission } from '../access'

/** Thrown when an authenticated staff member does not hold a route's required permission. */
export class InsufficientPermissionException extends ForbiddenException {
  constructor(permission: Permission) {
    super(`Requires the ${permission} permission`)
  }
}
