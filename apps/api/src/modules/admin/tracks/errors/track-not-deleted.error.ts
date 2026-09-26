import { ConflictException } from '@nestjs/common'

/** Thrown when a restore is requested for a track that is not currently deleted. */
export class TrackNotDeletedException extends ConflictException {
  constructor(id: string) {
    super(`Track ${id} is not deleted`)
  }
}
