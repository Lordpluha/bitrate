import { PUBLIC_TRACK_SQL } from '@modules/tracks/orm'
import { Prisma } from '@prisma/client'
import type { SearchFilters } from '../search.types'

/** Wraps a term for a case-insensitive `ILIKE` containment match. */
const contains = (term: string) => `%${term}%`

/** `AND` fragment restricting a release year, or nothing when unfiltered. */
const yearFilter = (column: Prisma.Sql, year?: number) =>
  year ? Prisma.sql`AND EXTRACT(YEAR FROM ${column}) = ${year}` : Prisma.empty

/** `AND` fragment restricting the artist name, or nothing when unfiltered. */
const artistFilter = (artist?: string) =>
  artist ? Prisma.sql`AND a.username ILIKE ${contains(artist)}` : Prisma.empty

/**
 * `AND EXISTS` fragment matching a genre by slug or name.
 *
 * The join table and owning column differ per bucket, so both arrive as
 * literal SQL fragments built at the call site — never from user input.
 */
const genreFilter = (joinTable: Prisma.Sql, ownerColumn: Prisma.Sql, genre?: string) =>
  genre
    ? Prisma.sql`AND EXISTS (
        SELECT 1 FROM ${joinTable} j JOIN "Genre" g ON g.id = j."genreId"
        WHERE ${ownerColumn} AND (g.slug = ${genre} OR g.name ILIKE ${genre})
      )`
    : Prisma.empty

/** Genre fragment for the track bucket. */
const trackGenre = (genre?: string) =>
  genreFilter(Prisma.sql`"TrackGenre"`, Prisma.sql`j."trackId" = t.id`, genre)

/** Genre fragment for the artist bucket. */
const artistGenre = (genre?: string) =>
  genreFilter(Prisma.sql`"ArtistGenre"`, Prisma.sql`j."artistId" = a.id`, genre)

/** Genre fragment for the album bucket. */
const albumGenre = (genre?: string) =>
  genreFilter(Prisma.sql`"AlbumGenre"`, Prisma.sql`j."albumId" = al.id`, genre)

/** Shared `WHERE` body for the track bucket, used by both counting and listing. */
export const trackWhere = (query: string, filters: SearchFilters) => Prisma.sql`
  WHERE ${PUBLIC_TRACK_SQL}
    AND (t.title % ${query} OR t.title ILIKE ${contains(query)}
      OR a.username ILIKE ${contains(query)})
    ${yearFilter(Prisma.sql`t."releaseDate"`, filters.year)}
    ${artistFilter(filters.artist)}
    ${trackGenre(filters.genre)}
    ${filters.hideExplicit ? Prisma.sql`AND t.explicit = false` : Prisma.empty}
`

/** Shared `WHERE` body for the artist bucket. */
export const artistWhere = (query: string, filters: SearchFilters) => Prisma.sql`
  WHERE a."deletedAt" IS NULL AND (a.username % ${query} OR a.username ILIKE ${contains(query)})
    ${artistFilter(filters.artist)}
    ${artistGenre(filters.genre)}
`

/** Shared `WHERE` body for the album bucket. */
export const albumWhere = (query: string, filters: SearchFilters) => Prisma.sql`
  WHERE al."deletedAt" IS NULL AND al."publishedAt" IS NOT NULL AND (al.title % ${query} OR al.title ILIKE ${contains(query)})
    ${yearFilter(Prisma.sql`al."releaseDate"`, filters.year)}
    ${artistFilter(filters.artist)}
    ${albumGenre(filters.genre)}
`

/** Shared `WHERE` body for the playlist bucket. */
export const playlistWhere = (query: string) => Prisma.sql`
  WHERE p."isPublic" = true AND p."deletedAt" IS NULL
    AND (p.title % ${query} OR p.title ILIKE ${contains(query)})
`
