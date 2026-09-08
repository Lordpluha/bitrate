import { NotFoundException } from '@nestjs/common'

/** Thrown when a user id does not resolve to an existing (non-deleted) user. */
export class UserNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`User ${id} not found`)
  }
}
