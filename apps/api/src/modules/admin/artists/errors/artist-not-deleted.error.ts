import { ConflictException } from '@nestjs/common'

/** Thrown when a restore is requested for an artist that is not currently deleted. */
export class ArtistNotDeletedException extends ConflictException {
  constructor(id: string) {
    super(`Artist ${id} is not deleted`)
  }
}
