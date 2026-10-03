import { ConflictException } from '@nestjs/common'

/** Thrown when a take-down is requested for an album that is already soft-deleted. */
export class AlbumAlreadyDeletedException extends ConflictException {
  constructor(id: string) {
    super(`Album ${id} is already deleted — restore it first`)
  }
}
