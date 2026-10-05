import { ConflictException } from '@nestjs/common'

/** Thrown when a restore is requested for a playlist that is not currently deleted. */
export class PlaylistNotDeletedException extends ConflictException {
  constructor(id: string) {
    super(`Playlist ${id} is not deleted`)
  }
}
