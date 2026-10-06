import { ConflictException } from '@nestjs/common'

/** Thrown when a take-down is requested for a playlist that is already soft-deleted. */
export class PlaylistAlreadyDeletedException extends ConflictException {
  constructor(id: string) {
    super(`Playlist ${id} is already deleted — restore it first`)
  }
}
