import { GenreWriteError } from '@domain/genre'

type GenreWriteErrorMessageInput = {
  error: unknown
  /** The slug the operator typed or the API derived, for the slug-taken message. */
  slug: string
}

/** Turns a rejected create/update into a sentence an operator can act on. */
export function genreWriteErrorMessage({ error, slug }: GenreWriteErrorMessageInput): string {
  if (!(error instanceof GenreWriteError)) return 'Could not save this genre.'

  switch (error.reason) {
    case 'slug-taken':
      return slug
        ? `The slug "${slug}" is already used by another genre.`
        : 'A genre with this slug already exists.'
    case 'invalid':
      return 'The API rejected the name, slug or colour.'
    case 'not-found':
      return 'This genre no longer exists.'
    default:
      return 'Could not save this genre.'
  }
}

/** The delete counterpart. Names the references that block the delete when the API sent them. */
export function genreDeleteErrorMessage(error: unknown): string {
  if (!(error instanceof GenreWriteError)) return 'Could not delete this genre.'

  switch (error.reason) {
    case 'in-use': {
      const counts = error.counts
      return counts
        ? `Still referenced by ${counts.tracks} tracks, ${counts.albums} albums and ${counts.artists} artists.`
        : 'This genre is still referenced by tracks, albums or artists.'
    }
    case 'not-found':
      return 'This genre no longer exists.'
    default:
      return 'Could not delete this genre.'
  }
}
