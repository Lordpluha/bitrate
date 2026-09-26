import { NotFoundException } from '@nestjs/common'

/** Thrown when a role id does not resolve to an existing role. */
export class RoleNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Role ${id} not found`)
  }
}
