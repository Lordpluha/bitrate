import { countGenreReferences, type Genre } from './genre'

/** Whether an action on a genre is allowed, and — when it is not — why, for the UI to say so. */
export type GenrePolicyDecision = { allowed: true } | { allowed: false; reason: string }

/**
 * A genre is deleted physically, so one that tracks, albums or artists still reference cannot
 * go — the API refuses with 409 as well. This only spares a doomed request and names the counts.
 */
export function canDeleteGenre(genre: Genre): GenrePolicyDecision {
  if (countGenreReferences(genre.counts) === 0) return { allowed: true }

  const { tracks, albums, artists } = genre.counts
  return {
    allowed: false,
    reason: `Still referenced by ${tracks} tracks, ${albums} albums and ${artists} artists.`,
  }
}
