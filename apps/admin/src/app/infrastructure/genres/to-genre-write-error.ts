import { HttpErrorResponse } from '@angular/common/http'
import { GenreWriteError } from '@domain/genre'
import { genreInUseBodyDto } from './genre.dto'

/** Which write the failing request was, since 409 means something different for each one. */
type GenreWriteOperation = 'create' | 'update' | 'delete'

/**
 * Maps a failed create/update/delete response onto `GenreWriteError`. This is the only place
 * that ever reads a status code for a genre write. A 409 on delete means "still referenced" and
 * carries the counts; on create/update it means the slug is taken.
 */
export function toGenreWriteError(error: unknown, operation: GenreWriteOperation): GenreWriteError {
  if (!(error instanceof HttpErrorResponse)) return new GenreWriteError('unknown')

  switch (error.status) {
    case 400:
      return new GenreWriteError('invalid')
    case 404:
      return new GenreWriteError('not-found')
    case 409: {
      if (operation !== 'delete') return new GenreWriteError('slug-taken')

      const body = genreInUseBodyDto.safeParse(error.error)
      return new GenreWriteError('in-use', body.success ? body.data.counts : undefined)
    }
    default:
      return new GenreWriteError('unknown')
  }
}
