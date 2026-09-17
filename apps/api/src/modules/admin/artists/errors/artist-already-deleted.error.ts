import { ConflictException } from '@nestjs/common'

/**
 * Thrown when a take-down, or any other mutation that requires an active artist, is requested
 * against one that is already soft-deleted — restoring it first is the only way forward.
 */
export class ArtistAlreadyDeletedException extends ConflictException {
  constructor(id: string) {
    super(`Artist ${id} is already deleted — restore it first`)
  }
}
