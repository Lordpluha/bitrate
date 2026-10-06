import { NotFoundException } from '@nestjs/common'

/** Thrown when an album id does not resolve to an existing album. */
export class AlbumNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Album ${id} not found`)
  }
}
