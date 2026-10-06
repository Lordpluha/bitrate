import { ConflictException } from '@nestjs/common'

/** Thrown when a restore is requested for an album that is not currently deleted. */
export class AlbumNotDeletedException extends ConflictException {
  constructor(id: string) {
    super(`Album ${id} is not deleted`)
  }
}
