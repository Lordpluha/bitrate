import { ConflictException } from '@nestjs/common'

/** Thrown when a take-down is requested for an episode that is already soft-deleted. */
export class EpisodeAlreadyDeletedException extends ConflictException {
  constructor(id: string) {
    super(`Episode ${id} is already deleted — restore it first`)
  }
}
