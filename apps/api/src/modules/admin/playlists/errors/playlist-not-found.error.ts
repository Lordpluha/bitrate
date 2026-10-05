import { NotFoundException } from '@nestjs/common'

/** Thrown when a playlist id does not resolve to an existing playlist. */
export class PlaylistNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Playlist ${id} not found`)
  }
}
