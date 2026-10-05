import { ConflictException } from '@nestjs/common'

/** Thrown when a restore is requested for an episode that is not currently deleted. */
export class EpisodeNotDeletedException extends ConflictException {
  constructor(id: string) {
    super(`Episode ${id} is not deleted`)
  }
}
