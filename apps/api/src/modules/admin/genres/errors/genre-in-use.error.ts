import { ConflictException, HttpStatus } from '@nestjs/common'

/** How many tracks, albums and artists still reference a genre. */
export type GenreReferenceCounts = { tracks: number; albums: number; artists: number }

/**
 * Thrown when a genre cannot be deleted because tracks, albums or artists still reference it.
 * The body carries the reference counts so the operator knows what blocks the delete.
 */
export class GenreInUseException extends ConflictException {
  constructor(id: string, counts: GenreReferenceCounts) {
    super({
      statusCode: HttpStatus.CONFLICT,
      error: 'Conflict',
      message: `Genre ${id} is still referenced by tracks, albums or artists`,
      counts,
    })
  }
}
