import { ConflictException } from '@nestjs/common'

/** Thrown when a restore is requested for a podcast that is not currently deleted. */
export class PodcastNotDeletedException extends ConflictException {
  constructor(id: string) {
    super(`Podcast ${id} is not deleted`)
  }
}
