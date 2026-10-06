import { NotFoundException } from '@nestjs/common'

/** Thrown when a podcast id does not resolve to an existing podcast. */
export class PodcastNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Podcast ${id} not found`)
  }
}
