import { ConflictException } from '@nestjs/common'

/** Thrown when a restore is requested for a user that is not currently deleted. */
export class UserNotDeletedException extends ConflictException {
  constructor(id: string) {
    super(`User ${id} is not deleted`)
  }
}
