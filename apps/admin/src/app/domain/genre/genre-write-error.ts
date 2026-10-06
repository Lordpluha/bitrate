import type { GenreCounts } from './genre'

/**
 * Why the API refused a genre write. `infrastructure/genres` is the only place that ever inspects
 * an HTTP status — this is what reaches presentation instead.
 */
export type GenreWriteFailureReason = 'slug-taken' | 'invalid' | 'in-use' | 'not-found' | 'unknown'

/** Thrown by `GenreRepository.create` / `.update` / `.delete` when the API refuses the write. */
export class GenreWriteError extends Error {
  /** @param counts What still references the genre — only set for `'in-use'`. */
  constructor(
    readonly reason: GenreWriteFailureReason,
    readonly counts?: GenreCounts,
  ) {
    super(`Genre write refused: ${reason}`)
    this.name = 'GenreWriteError'
  }
}
