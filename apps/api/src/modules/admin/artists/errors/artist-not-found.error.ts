import { NotFoundException } from '@nestjs/common'

/** Thrown when an artist id does not resolve to an existing (non-deleted) artist. */
export class ArtistNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Artist ${id} not found`)
  }
}
