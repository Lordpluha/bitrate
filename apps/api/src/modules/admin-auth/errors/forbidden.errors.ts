import { ForbiddenException } from '@nestjs/common'
import type { StaffRole } from '@prisma/client'

/** Thrown when an authenticated staff member's role does not satisfy a route's requirement. */
export class InsufficientRoleException extends ForbiddenException {
  constructor(requiredRoles: StaffRole[]) {
    super(`Requires one of the following roles: ${requiredRoles.join(', ')}`)
  }
}
