import { NotFoundException } from '@nestjs/common'

/** Thrown when a track id does not resolve to an existing (non-deleted) track. */
export class TrackNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Track ${id} not found`)
  }
}
