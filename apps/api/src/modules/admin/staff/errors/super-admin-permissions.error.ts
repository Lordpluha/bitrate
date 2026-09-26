import { BadRequestException } from '@nestjs/common'

/**
 * Thrown when a caller tries to replace the permission set of an operator holding the
 * built-in `ADMIN` role. That role is super by identity — its own `permissions` array is
 * always `[]` and is never consulted — so editing it directly is never meaningful.
 */
export class SuperAdminPermissionsException extends BadRequestException {
  constructor(id: string) {
    super(`Operator ${id} holds the built-in ADMIN role; its permissions cannot be edited directly`)
  }
}
