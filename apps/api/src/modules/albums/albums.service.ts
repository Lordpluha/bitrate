import { normalizePagination, type PaginationInput } from '@common/pagination'
import { rightsConfirmationRecord } from '@common/rights-confirmation'
import { isPrismaP2025 } from '@common/utils/prisma'
import { NS, TTL } from '@infra/cache/cache.constants'
import { CacheService } from '@infra/cache/cache.service'
import { PrismaService } from '@infra/prisma/prisma.service'
import { ArtistEntity } from '@modules/artists'
import { PUBLIC_TRACK_WHERE } from '@modules/tracks/track-visibility'
import type { UserEntity } from '@modules/users'
import { Injectable, NotFoundException } from '@nestjs/common'
import type { AlbumType, Prisma } from '@prisma/client'
import { PUBLIC_ALBUM_WHERE } from './album-visibility'
import { CreateAlbumDto } from './dtos/create-album.dto'
import { UpdateAlbumDto } from './dtos/update-album.dto'
import { AlbumEntity } from './entities'

/** The listener-facing album of a release that went live. */
export type ReleaseAlbumInput = {
  artistId: string
  title: string
  type: AlbumType
  cover: string | null
  publishedAt: Date
  /** Published tracks in running order. */
  trackIds: string[]
}

/**
 * Loads an album's playable tracks in running order.
 *
 * Shared by the list and detail queries so both always project the same shape.
 */
export const ALBUM_TRACKS_INCLUDE = {
  tracks: {
    where: { track: PUBLIC_TRACK_WHERE },
    include: { track: true },
    orderBy: [{ discNumber: 'asc' }, { trackNumber: 'asc' }],
  },
} satisfies Prisma.AlbumInclude

/** An `AlbumTrack` join row with its track loaded. */
type AlbumTrackWithTrack = Prisma.AlbumTrackGetPayload<{ include: { track: true } }>

/**
 * Flattens an album membership row into the track it points at.
 *
 * The join row's own `id` is dropped deliberately: spreading it over the track
 * replaced `track.id` with the `AlbumTrack` id, so the client sent a
 * non-existent id to the playback endpoints and nothing on an album page could
 * play. The remaining membership fields still win over the track's own, which
 * is what gives an album its per-album `trackNumber`/`discNumber`.
 */
const flattenAlbumTrack = ({ track, id: _membershipId, ...membership }: AlbumTrackWithTrack) => ({
  ...track,
  ...membership,
})

@Injectable()
export class AlbumsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async findAll({
    page = 1,
    limit = 10,
    title,
    artistId,
  }: { page?: number; limit?: number } & Pick<Partial<AlbumEntity>, 'artistId' | 'title'>) {
    const pagination = normalizePagination(page, limit)
    const where = {
      ...PUBLIC_ALBUM_WHERE,
      ...(artistId ? { artistId } : {}),
      ...(title ? { title: { contains: title, mode: 'insensitive' as const } } : {}),
    }
    return await this.cache.wrap(
      NS.ALBUMS,
      `list:${pagination.page}:${pagination.limit}:${title ?? ''}:${artistId ?? ''}`,
      TTL.SHORT,
      async () => {
        const [albums, total] = await this.prisma.$transaction([
          this.prisma.album.findMany({
            skip: pagination.skip,
            take: pagination.limit,
            where,
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            include: ALBUM_TRACKS_INCLUDE,
          }),
          this.prisma.album.count({ where }),
        ])
        const data = albums.map((album) => ({
          ...album,
          tracks: album.tracks.map(flattenAlbumTrack),
        }))
        return { data, total, page: pagination.page, limit: pagination.limit }
      },
    )
  }

  /**
   * The album each track belongs to, for track lists that show an album column. A track on several
   * albums (a deluxe edition, a compilation) is shown on its earliest one, by release date and then
   * creation. Every requested id gets an entry; a single or deleted album answers null.
   */
  async findForTracks(trackIds: string[]) {
    const rows = await this.prisma.albumTrack.findMany({
      where: { trackId: { in: trackIds }, album: PUBLIC_ALBUM_WHERE },
      select: {
        trackId: true,
        album: { select: { id: true, title: true, releaseDate: true, createdAt: true } },
      },
    })
    const sortKey = ({ releaseDate, createdAt }: (typeof rows)[number]['album']) =>
      (releaseDate ?? createdAt).getTime()
    const earliest = new Map<string, (typeof rows)[number]['album']>()
    for (const { trackId, album } of rows) {
      const current = earliest.get(trackId)
      if (!current || sortKey(album) < sortKey(current)) earliest.set(trackId, album)
    }
    return {
      data: trackIds.map((trackId) => {
        const album = earliest.get(trackId)
        return { trackId, album: album ? { id: album.id, title: album.title } : null }
      }),
    }
  }

  /**
   * The user's saved albums, newest like first. Not cached: a like or unlike must show at once.
   * Deleted albums drop out; their tracks keep the same shape as the album list.
   */
  async findLiked(userId: UserEntity['id'], { page = 1, limit = 10 }: PaginationInput) {
    const pagination = normalizePagination(page, limit)
    const where = { userId, album: PUBLIC_ALBUM_WHERE }
    const [likes, total] = await this.prisma.$transaction([
      this.prisma.userLikedAlbum.findMany({
        where,
        include: { album: { include: ALBUM_TRACKS_INCLUDE } },
        orderBy: [{ createdAt: 'desc' }, { albumId: 'desc' }],
        skip: pagination.skip,
        take: pagination.limit,
      }),
      this.prisma.userLikedAlbum.count({ where }),
    ])
    return {
      data: likes.map(({ album, createdAt }) => ({
        ...album,
        tracks: album.tracks.map(flattenAlbumTrack),
        likedAt: createdAt,
      })),
      total,
      page: pagination.page,
      limit: pagination.limit,
    }
  }

  async getById(id: AlbumEntity['id']) {
    return await this.cache.wrap(NS.ALBUMS, `id:${id}`, TTL.LONG, () =>
      this.prisma.album
        .findFirst({
          where: { id, ...PUBLIC_ALBUM_WHERE },
          include: ALBUM_TRACKS_INCLUDE,
        })
        .then((album) =>
          album
            ? {
                ...album,
                tracks: album.tracks.map(flattenAlbumTrack),
              }
            : null,
        ),
    )
  }

  async create(artistId: ArtistEntity['id'], createDto: CreateAlbumDto) {
    const artist = await this.prisma.artist.findUnique({
      where: { id: artistId },
      select: { id: true, deletedAt: true },
    })
    if (!artist || artist.deletedAt) throw new NotFoundException('Artist not found')

    const { rightsConfirmed: _rightsConfirmed, ...albumData } = createDto
    const album = await this.prisma.album.create({
      data: { artistId: artist.id, ...albumData, ...rightsConfirmationRecord() },
    })
    await Promise.all([this.cache.invalidate(NS.ALBUMS), this.cache.invalidate(NS.SEARCH)])
    return album
  }

  /**
   * Creates the published album of a release that just went live, inside the caller's
   * transaction, with its tracks in running order. Callers drop caches after commit.
   */
  async createForRelease(tx: Prisma.TransactionClient, input: ReleaseAlbumInput) {
    const album = await tx.album.create({
      data: {
        artistId: input.artistId,
        title: input.title,
        type: input.type,
        cover: input.cover,
        releaseDate: input.publishedAt,
        publishedAt: input.publishedAt,
        totalTracks: input.trackIds.length,
        ...rightsConfirmationRecord(input.publishedAt),
        tracks: {
          create: input.trackIds.map((trackId, index) => ({ trackId, trackNumber: index + 1 })),
        },
      },
      select: { id: true },
    })
    return album.id
  }

  /** Shows (`at`) or hides (null) a release's album inside the caller's transaction. */
  async setReleaseAlbumVisibility(tx: Prisma.TransactionClient, albumId: string, at: Date | null) {
    await tx.album.update({ where: { id: albumId }, data: { publishedAt: at } })
  }

  /** Drops album and search caches after a release changed what listeners can see. */
  async invalidateCatalogueCaches() {
    await Promise.all([this.cache.invalidate(NS.ALBUMS), this.cache.invalidate(NS.SEARCH)])
  }

  /** Updates an album the artist owns; a missing, deleted or foreign album is a 404. */
  async update(artistId: ArtistEntity['id'], id: AlbumEntity['id'], updateDto: UpdateAlbumDto) {
    const updated = await this.ownedAlbumWrite(() =>
      this.prisma.album.update({ where: { id, artistId, deletedAt: null }, data: updateDto }),
    )
    await Promise.all([this.cache.invalidate(NS.ALBUMS), this.cache.invalidate(NS.SEARCH)])
    return updated
  }

  /** Soft-deletes an album the artist owns; a missing, deleted or foreign album is a 404. */
  async delete(artistId: ArtistEntity['id'], id: AlbumEntity['id']) {
    const deleted = await this.ownedAlbumWrite(() =>
      this.prisma.album.update({
        where: { id, artistId, deletedAt: null },
        data: { deletedAt: new Date() },
        omit: { artistId: true },
      }),
    )
    await Promise.all([this.cache.invalidate(NS.ALBUMS), this.cache.invalidate(NS.SEARCH)])
    return deleted
  }

  async like(userId: UserEntity['id'], albumId: AlbumEntity['id']) {
    const album = await this.prisma.album.findFirst({
      where: { id: albumId, ...PUBLIC_ALBUM_WHERE },
    })
    if (!album) throw new NotFoundException('Album not found')
    await this.prisma.userLikedAlbum.upsert({
      where: { userId_albumId: { userId, albumId } },
      update: {},
      create: { userId, albumId },
    })
    return album
  }

  async unlike(userId: UserEntity['id'], albumId: AlbumEntity['id']) {
    const album = await this.prisma.album.findFirst({
      where: { id: albumId, ...PUBLIC_ALBUM_WHERE },
    })
    if (!album) throw new NotFoundException('Album not found')
    await this.prisma.userLikedAlbum.deleteMany({ where: { userId, albumId } })
    return album
  }

  /**
   * Runs a write filtered on the album's owner and deletion state, so the check and the write are
   * one query; Prisma's "record not found" becomes the module's 404.
   */
  private async ownedAlbumWrite<T>(write: () => Promise<T>): Promise<T> {
    try {
      return await write()
    } catch (error: unknown) {
      if (isPrismaP2025(error)) {
        throw new NotFoundException('Album not found or does not belong to the artist')
      }
      throw error
    }
  }
}
