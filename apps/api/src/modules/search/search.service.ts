import { NS, TTL } from '@infra/cache/cache.constants'
import { CacheService } from '@infra/cache/cache.service'
import { PrismaService } from '@infra/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'

/** Defines the search type. */
export type SearchType = 'tracks' | 'artists' | 'albums' | 'playlists'

/** The all types value. */
const ALL_TYPES: SearchType[] = ['tracks', 'artists', 'albums', 'playlists']

/** Defines the track result. */
type TrackResult = {
  id: string
  title: string
  cover: string | null
  artistId: string
  rank: number
}
/** Defines the artist result. */
type ArtistResult = {
  id: string
  username: string
  avatar: string | null
  bio: string | null
  rank: number
}
/** Defines the album result. */
type AlbumResult = {
  id: string
  title: string
  cover: string | null
  artistId: string
  rank: number
}
/** Defines the playlist result. */
type PlaylistResult = {
  id: string
  title: string
  cover: string | null
  userId: string
  isPublic: boolean
  rank: number
}

/** Represents the search service. */
@Injectable()
export class SearchService {
  /** Creates a new instance. */
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  /** Runs the search operation. */
  async search(query: string, types: SearchType[] = ALL_TYPES, limit = 10) {
    const key = `${[...types].sort().join(',')}:${limit}:${query}`

    return await this.cache.wrap(NS.SEARCH, key, TTL.MEDIUM, async () => {
      const results: Record<string, unknown[]> = {}
      await Promise.all(
        types.map(async (type) => {
          results[type] = await this.searchType(type, query, limit)
        }),
      )
      return results
    })
  }

  /** Runs the search type operation. */
  private searchType(type: SearchType, query: string, limit: number) {
    switch (type) {
      case 'tracks':
        return this.searchTracks(query, limit)
      case 'artists':
        return this.searchArtists(query, limit)
      case 'albums':
        return this.searchAlbums(query, limit)
      case 'playlists':
        return this.searchPlaylists(query, limit)
    }
  }

  /** Runs the search tracks operation. */
  private searchTracks(query: string, limit: number) {
    const like = `%${query}%`
    return this.prisma.queryRaw<TrackResult[]>(Prisma.sql`
      SELECT id, title, cover, "artistId",
             ts_rank(to_tsvector('english', title), plainto_tsquery('english', ${query})) AS rank
      FROM "Track"
      WHERE to_tsvector('english', title) @@ plainto_tsquery('english', ${query})
         OR title ILIKE ${like}
      ORDER BY rank DESC LIMIT ${limit}
    `)
  }

  /** Runs the search artists operation. */
  private searchArtists(query: string, limit: number) {
    const like = `%${query}%`
    return this.prisma.queryRaw<ArtistResult[]>(Prisma.sql`
      SELECT id, username, avatar, bio,
             ts_rank(to_tsvector('english', username), plainto_tsquery('english', ${query})) AS rank
      FROM "Artist"
      WHERE to_tsvector('english', username) @@ plainto_tsquery('english', ${query})
         OR username ILIKE ${like}
      ORDER BY rank DESC LIMIT ${limit}
    `)
  }

  /** Runs the search albums operation. */
  private searchAlbums(query: string, limit: number) {
    const like = `%${query}%`
    return this.prisma.queryRaw<AlbumResult[]>(Prisma.sql`
      SELECT id, title, cover, "artistId",
             ts_rank(to_tsvector('english', title), plainto_tsquery('english', ${query})) AS rank
      FROM "Album"
      WHERE to_tsvector('english', title) @@ plainto_tsquery('english', ${query})
         OR title ILIKE ${like}
      ORDER BY rank DESC LIMIT ${limit}
    `)
  }

  /** Runs the search playlists operation. */
  private searchPlaylists(query: string, limit: number) {
    const like = `%${query}%`
    return this.prisma.queryRaw<PlaylistResult[]>(Prisma.sql`
      SELECT id, title, cover, "userId", "isPublic",
             ts_rank(to_tsvector('english', title), plainto_tsquery('english', ${query})) AS rank
      FROM "Playlist"
      WHERE "isPublic" = true
        AND (
          to_tsvector('english', title) @@ plainto_tsquery('english', ${query})
          OR title ILIKE ${like}
        )
      ORDER BY rank DESC LIMIT ${limit}
    `)
  }
}
