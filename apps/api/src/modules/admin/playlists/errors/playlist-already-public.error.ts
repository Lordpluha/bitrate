import { ConflictException } from '@nestjs/common'

/** Thrown when an unhide is requested for a playlist that is already public. */
export class PlaylistAlreadyPublicException extends ConflictException {
  constructor(id: string) {
    super(`Playlist ${id} is already public`)
  }
}
