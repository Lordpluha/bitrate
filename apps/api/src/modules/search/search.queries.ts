import type { PrismaService } from '@infra/prisma/prisma.service'
import { Prisma } from '@prisma/client'
import type { SearchCount, SearchFilters, SearchResult, SearchType } from './search.types'

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
const trackWhere = (query: string, filters: SearchFilters) => Prisma.sql`
  WHERE t."processingStatus" = 'READY' AND t."deletedAt" IS NULL
    AND (t.title % ${query} OR t.title ILIKE ${contains(query)}
      OR a.username ILIKE ${contains(query)})
    ${yearFilter(Prisma.sql`t."releaseDate"`, filters.year)}
    ${artistFilter(filters.artist)}
    ${trackGenre(filters.genre)}
`

/** Shared `WHERE` body for the artist bucket. */
const artistWhere = (query: string, filters: SearchFilters) => Prisma.sql`
  WHERE a."deletedAt" IS NULL AND (a.username % ${query} OR a.username ILIKE ${contains(query)})
    ${artistFilter(filters.artist)}
    ${artistGenre(filters.genre)}
`

/** Shared `WHERE` body for the album bucket. */
const albumWhere = (query: string, filters: SearchFilters) => Prisma.sql`
  WHERE al."deletedAt" IS NULL AND (al.title % ${query} OR al.title ILIKE ${contains(query)})
    ${yearFilter(Prisma.sql`al."releaseDate"`, filters.year)}
    ${artistFilter(filters.artist)}
    ${albumGenre(filters.genre)}
`

/** Shared `WHERE` body for the playlist bucket. */
const playlistWhere = (query: string) => Prisma.sql`
  WHERE p."isPublic" = true AND p."deletedAt" IS NULL
    AND (p.title % ${query} OR p.title ILIKE ${contains(query)})
`

/** The `FROM` clause each bucket counts and lists over. */
const FROM = {
  tracks: Prisma.sql`FROM "Track" t JOIN "Artist" a ON a.id = t."artistId"`,
  artists: Prisma.sql`FROM "Artist" a`,
  albums: Prisma.sql`FROM "Album" al JOIN "Artist" a ON a.id = al."artistId"`,
  playlists: Prisma.sql`FROM "Playlist" p JOIN "User" u ON u.id = p."userId"`,
}

/** Everything a bucket listing needs beyond the query itself. */
export type SearchPageInput = {
  prisma: PrismaService
  query: string
  limit: number
  offset: number
  filters: SearchFilters
}

/** Runs a `COUNT(*)` for one bucket. */
async function count(prisma: PrismaService, sql: Prisma.Sql): Promise<number> {
  const [result] = await prisma.queryRaw<SearchCount[]>(sql)
  return result?.count ?? 0
}

/** Counts every row matching a query in one bucket, ignoring pagination. */
export function countType(
  prisma: PrismaService,
  type: SearchType,
  query: string,
  filters: SearchFilters,
): Promise<number> {
  switch (type) {
    case 'tracks':
      return count(
        prisma,
        Prisma.sql`SELECT COUNT(*)::int AS count ${FROM.tracks} ${trackWhere(query, filters)}`,
      )
    case 'artists':
      return count(
        prisma,
        Prisma.sql`SELECT COUNT(*)::int AS count ${FROM.artists} ${artistWhere(query, filters)}`,
      )
    case 'albums':
      return count(
        prisma,
        Prisma.sql`SELECT COUNT(*)::int AS count ${FROM.albums} ${albumWhere(query, filters)}`,
      )
    case 'playlists':
      return count(
        prisma,
        Prisma.sql`SELECT COUNT(*)::int AS count FROM "Playlist" p ${playlistWhere(query)}`,
      )
  }
}

/** Returns one ranked page of a single bucket. */
export function searchType(type: SearchType, input: SearchPageInput): Promise<SearchResult[]> {
  const { prisma, query, limit, offset, filters } = input

  switch (type) {
    case 'tracks':
      return prisma.queryRaw<SearchResult[]>(Prisma.sql`
        SELECT t.id, t.title, a.username AS subtitle, t.cover AS image, 'tracks' AS type,
          a.id AS "artistId", NULL::uuid AS "ownerId",
          GREATEST(similarity(t.title, ${query}), similarity(a.username, ${query})) AS rank
        ${FROM.tracks}
        ${trackWhere(query, filters)}
        ORDER BY rank DESC, t.popularity DESC, t.id ASC
        LIMIT ${limit} OFFSET ${offset}
      `)
    case 'artists':
      return prisma.queryRaw<SearchResult[]>(Prisma.sql`
        SELECT a.id, a.username AS title, a.bio AS subtitle, a.avatar AS image, 'artists' AS type,
          NULL::uuid AS "artistId", NULL::uuid AS "ownerId",
          similarity(a.username, ${query}) AS rank
        ${FROM.artists}
        ${artistWhere(query, filters)}
        ORDER BY rank DESC, a."monthlyListeners" DESC, a.id ASC
        LIMIT ${limit} OFFSET ${offset}
      `)
    case 'albums':
      return prisma.queryRaw<SearchResult[]>(Prisma.sql`
        SELECT al.id, al.title, a.username AS subtitle, al.cover AS image, 'albums' AS type,
          a.id AS "artistId", NULL::uuid AS "ownerId",
          GREATEST(similarity(al.title, ${query}), similarity(a.username, ${query})) AS rank
        ${FROM.albums}
        ${albumWhere(query, filters)}
        ORDER BY rank DESC, al."releaseDate" DESC NULLS LAST, al.id ASC
        LIMIT ${limit} OFFSET ${offset}
      `)
    case 'playlists':
      return prisma.queryRaw<SearchResult[]>(Prisma.sql`
        SELECT p.id, p.title, u.username AS subtitle, p.cover AS image, 'playlists' AS type,
          NULL::uuid AS "artistId", u.id AS "ownerId",
          similarity(p.title, ${query}) AS rank
        ${FROM.playlists}
        ${playlistWhere(query)}
        ORDER BY rank DESC, p."followersCount" DESC, p.id ASC
        LIMIT ${limit} OFFSET ${offset}
      `)
  }
}
