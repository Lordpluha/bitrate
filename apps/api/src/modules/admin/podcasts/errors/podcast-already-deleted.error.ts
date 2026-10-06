import { ConflictException } from '@nestjs/common'

/** Thrown when a take-down is requested for a podcast that is already soft-deleted. */
export class PodcastAlreadyDeletedException extends ConflictException {
  constructor(id: string) {
    super(`Podcast ${id} is already deleted — restore it first`)
  }
}
