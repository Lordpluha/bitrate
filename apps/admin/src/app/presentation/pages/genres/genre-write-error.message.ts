import { GenreWriteError } from '@domain/genre'
import type { Notice } from '@presentation/pages/shared/resource-write-error.message'

type GenreWriteErrorInput = {
  error: unknown
  /** The slug the operator typed or the API derived, for the slug-taken message. */
  slug: string
}

/** Turns a rejected create/update into a sentence an operator can act on. */
export function genreWriteError({ error, slug }: GenreWriteErrorInput): Notice {
  if (!(error instanceof GenreWriteError)) return { key: 'genre.error.save' }

  switch (error.reason) {
    case 'slug-taken':
      return slug
        ? { key: 'genre.error.slugTaken', params: { slug } }
        : { key: 'genre.error.slugTakenUnnamed' }
    case 'invalid':
      return { key: 'genre.error.invalid' }
    case 'not-found':
      return { key: 'genre.error.gone' }
    default:
      return { key: 'genre.error.save' }
  }
}

/** The delete counterpart. Names the references that block the delete when the API sent them. */
export function genreDeleteError(error: unknown): Notice {
  if (!(error instanceof GenreWriteError)) return { key: 'genre.error.delete' }

  switch (error.reason) {
    case 'in-use': {
      const counts = error.counts
      return counts
        ? { key: 'genres.usedBy', params: { ...counts } }
        : { key: 'genre.error.inUseUnknown' }
    }
    case 'not-found':
      return { key: 'genre.error.gone' }
    default:
      return { key: 'genre.error.delete' }
  }
}
