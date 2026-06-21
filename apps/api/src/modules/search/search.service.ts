import { PrismaService } from '@infra/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'

export type SearchType = 'tracks' | 'artists' | 'albums' | 'playlists'

const ALL_TYPES: SearchType[] = ['tracks', 'artists', 'albums', 'playlists']

type TrackResult = {
  id: string
  title: string
  cover: string | null
  artistId: string
  rank: number
}
type ArtistResult = {
  id: string
  username: string
  avatar: string | null
  bio: string | null
  rank: number
}
type AlbumResult = {
  id: string
  title: string
  cover: string | null
  artistId: string
  rank: number
}
type PlaylistResult = {
  id: string
  title: string
  cover: string | null
  userId: string
  isPublic: boolean
  rank: number
}

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: string, types: SearchType[] = ALL_TYPES, limit = 10) {
    const results: Record<string, unknown[]> = {}

    await Promise.all(
      types.map(async (type) => {
        results[type] = await this.searchType(type, query, limit)
      }),
    )

    return results
  }

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

  private searchTracks(query: string, limit: number) {
    const like = `%${query}%`
    return this.prisma.queryRaw<TrackResult[]>(
      Prisma.sql`
        SELECT id, title, cover, "artistId",
               ts_rank(to_tsvector('english', title), plainto_tsquery('english', ${query})) AS rank
        FROM "Track"
        WHERE to_tsvector('english', title) @@ plainto_tsquery('english', ${query})
           OR title ILIKE ${like}
        ORDER BY rank DESC
        LIMIT ${limit}
      `,
    )
  }

  private searchArtists(query: string, limit: number) {
    const like = `%${query}%`
    return this.prisma.queryRaw<ArtistResult[]>(
      Prisma.sql`
        SELECT id, username, avatar, bio,
               ts_rank(to_tsvector('english', username), plainto_tsquery('english', ${query})) AS rank
        FROM "Artist"
        WHERE to_tsvector('english', username) @@ plainto_tsquery('english', ${query})
           OR username ILIKE ${like}
        ORDER BY rank DESC
        LIMIT ${limit}
      `,
    )
  }

  private searchAlbums(query: string, limit: number) {
    const like = `%${query}%`
    return this.prisma.queryRaw<AlbumResult[]>(
      Prisma.sql`
        SELECT id, title, cover, "artistId",
               ts_rank(to_tsvector('english', title), plainto_tsquery('english', ${query})) AS rank
        FROM "Album"
        WHERE to_tsvector('english', title) @@ plainto_tsquery('english', ${query})
           OR title ILIKE ${like}
        ORDER BY rank DESC
        LIMIT ${limit}
      `,
    )
  }

  private searchPlaylists(query: string, limit: number) {
    const like = `%${query}%`
    return this.prisma.queryRaw<PlaylistResult[]>(
      Prisma.sql`
        SELECT id, title, cover, "userId", "isPublic",
               ts_rank(to_tsvector('english', title), plainto_tsquery('english', ${query})) AS rank
        FROM "Playlist"
        WHERE "isPublic" = true
          AND (
            to_tsvector('english', title) @@ plainto_tsquery('english', ${query})
            OR title ILIKE ${like}
          )
        ORDER BY rank DESC
        LIMIT ${limit}
      `,
    )
  }
}
