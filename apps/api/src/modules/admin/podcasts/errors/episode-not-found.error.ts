import { NotFoundException } from '@nestjs/common'

/** Thrown when an episode id does not resolve to an episode of the addressed podcast. */
export class EpisodeNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Episode ${id} not found`)
  }
}
