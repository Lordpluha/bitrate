import { ConflictException } from '@nestjs/common'

/** Thrown when a hide is requested for a playlist that is already private. */
export class PlaylistAlreadyHiddenException extends ConflictException {
  constructor(id: string) {
    super(`Playlist ${id} is already private`)
  }
}
