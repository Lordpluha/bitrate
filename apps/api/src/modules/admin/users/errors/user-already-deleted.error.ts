import { ConflictException } from '@nestjs/common'

/**
 * Thrown when a take-down, or any other mutation that requires an active user, is requested
 * against one that is already soft-deleted — restoring it first is the only way forward.
 */
export class UserAlreadyDeletedException extends ConflictException {
  constructor(id: string) {
    super(`User ${id} is already deleted — restore it first`)
  }
}
