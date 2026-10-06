import type { Sort } from '../shared/sort'

/** How many tracks, albums and artists reference a genre. */
export type GenreCounts = {
  tracks: number
  albums: number
  artists: number
}

/** A genre as the operator panel understands it. */
export type Genre = {
  id: string
  slug: string
  name: string
  description: string | null
  /** A `#rrggbb` string. Data the operator curates, not a design token. */
  color: string | null
  counts: GenreCounts
  createdAt: Date
  updatedAt: Date
}

/**
 * The columns the genre list can be ordered by. Bound to the contract's `sort` query
 * parameter in `infrastructure/genres/genre.mapper.ts` through an exhaustive record.
 */
export type GenreSortField = 'name' | 'slug' | 'createdAt'

/** What an operator can narrow the genre list by. */
export type GenreFilter = {
  query?: string
  sort?: Sort<GenreSortField>
}

/** Total references across tracks, albums and artists. */
export function countGenreReferences({ tracks, albums, artists }: GenreCounts): number {
  return tracks + albums + artists
}
