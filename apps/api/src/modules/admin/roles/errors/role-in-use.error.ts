import { ConflictException } from '@nestjs/common'

/** Thrown when a role cannot be deleted because active operators still reference it. */
export class RoleInUseException extends ConflictException {
  constructor(id: string) {
    super(`Role ${id} is still assigned to active operators`)
  }
}
