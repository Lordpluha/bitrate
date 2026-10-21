import { normalizePagination, type PaginationInput } from '@common/pagination'
import { readUserSettings } from '@common/user-settings'
import { isPrismaP2002, isPrismaP2025, isPrismaP2034 } from '@common/utils/prisma'
import { NS } from '@infra/cache/cache.constants'
import { CacheService } from '@infra/cache/cache.service'
import { PrismaService } from '@infra/prisma/prisma.service'
import { UserEntity } from '@modules/users'
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { AddTracksDto, CreatePlaylistDto, UpdatePlaylistDto } from './dtos'
import { PlaylistEntity } from './entities'

/** Leading tracks listed per owned playlist, enough for a cover mosaic; `_count` has the total. */
const MINE_PREVIEW_TRACKS = 4

/** Appends retried after a position race or serialization failure. */
const ADD_TRACKS_ATTEMPTS = 3

/** Playlist CRUD, likes and track membership. */
@Injectable()
export class PlaylistsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  /** Creates an empty playlist owned by the user. */
  async create(userId: UserEntity['id'], playlistDto: CreatePlaylistDto) {
    const playlist = await this.prisma.playlist.create({
      data: {
        userId,
        cover: '',
        ...playlistDto,
      },
    })
    await this.cache.invalidate(NS.SEARCH)
    return playlist
  }

  /** Public playlists, newest first; optionally one owner's profile list. */
  async getAll({ page = 1, limit = 10, userId }: PaginationInput & { userId?: UserEntity['id'] }) {
    const pagination = normalizePagination(page, limit)
    /* a profile lists the owner's public playlists only while they keep them on their profile */
    if (userId && !(await readUserSettings(this.prisma, userId)).publicPlaylistsOnProfile) {
      return { data: [], total: 0, page: pagination.page, limit: pagination.limit }
    }
    /* only public playlists, optionally one owner's (a profile page) */
    const where = { isPublic: true, deletedAt: null, ...(userId ? { userId } : {}) }
    const [data, total] = await this.prisma.$transaction([
      this.prisma.playlist.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      }),
      this.prisma.playlist.count({ where }),
    ])

    return { data, total, page: pagination.page, limit: pagination.limit }
  }

  /**
   * Playlists the user liked, newest like first. A liked playlist stays listed while it is
   * public or the user's own; one its owner made private drops out. Not cached.
   */
  async findLiked(userId: UserEntity['id'], { page = 1, limit = 10 }: PaginationInput) {
    const pagination = normalizePagination(page, limit)
    const where = {
      userId,
      playlist: { deletedAt: null, OR: [{ isPublic: true }, { userId }] },
    }
    const [likes, total] = await this.prisma.$transaction([
      this.prisma.userLikedPlaylist.findMany({
        where,
        include: { playlist: { include: { user: { select: { id: true, username: true } } } } },
        orderBy: [{ createdAt: 'desc' }, { playlistId: 'desc' }],
        skip: pagination.skip,
        take: pagination.limit,
      }),
      this.prisma.userLikedPlaylist.count({ where }),
    ])
    return {
      data: likes.map(({ playlist, createdAt }) => ({ ...playlist, likedAt: createdAt })),
      total,
      page: pagination.page,
      limit: pagination.limit,
    }
  }

  /** An active playlist by id, regardless of visibility. */
  async getById(id: PlaylistEntity['id']) {
    const playlist = await this.prisma.playlist.findFirst({ where: { id, deletedAt: null } })
    if (!playlist) throw new NotFoundException('Playlist not found')
    return playlist
  }

  /** A visible playlist with its ready tracks in position order and its owner. */
  async getByIdPopulated(id: PlaylistEntity['id'], userId?: UserEntity['id']) {
    const playlist = await this.prisma.playlist.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(userId ? { OR: [{ isPublic: true }, { userId }] } : { isPublic: true }),
      },
      include: {
        tracks: {
          where: { track: { processingStatus: 'READY', deletedAt: null } },
          include: { track: true },
          orderBy: { position: 'asc' },
        },
        user: {
          select: {
            avatar: true,
            id: true,
            username: true,
          },
        },
      },
    })

    if (!playlist) throw new NotFoundException('Playlist not found')

    return {
      ...playlist,
      tracks: playlist.tracks.map(({ id: playlistTrackId, track, ...membership }) => ({
        ...track,
        ...membership,
        playlistTrackId,
      })),
    }
  }

  /** Updates the user's own playlist. */
  async update(userId: UserEntity['id'], id: PlaylistEntity['id'], updateDto: UpdatePlaylistDto) {
    await this.requireOwned(userId, id, 'forbid')

    const updated = await this.prisma.playlist.update({ where: { id }, data: updateDto })
    await this.cache.invalidate(NS.SEARCH)
    return updated
  }

  /** Soft-deletes the user's own playlist. */
  async delete(userId: UserEntity['id'], id: PlaylistEntity['id']) {
    await this.requireOwned(userId, id, 'forbid')

    const deleted = await this.prisma.playlist.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
    await this.cache.invalidate(NS.SEARCH)
    return deleted
  }

  /** Likes a public playlist; liking twice is a no-op. */
  async like(userId: UserEntity['id'], playlistId: PlaylistEntity['id']) {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const playlist = await tx.playlist.findFirst({
          where: { id: playlistId, isPublic: true, deletedAt: null },
        })
        if (!playlist) throw new NotFoundException('Playlist not found')

        const existing = await tx.userLikedPlaylist.findUnique({
          where: { userId_playlistId: { userId, playlistId } },
        })
        if (existing) return playlist

        await tx.userLikedPlaylist.create({ data: { userId, playlistId } })
        return await tx.playlist.update({
          where: { id: playlistId },
          data: { followersCount: { increment: 1 } },
        })
      })
      await this.cache.invalidate(NS.SEARCH)
      return result
    } catch (error: unknown) {
      if (isPrismaP2025(error)) throw new NotFoundException('Playlist not found')
      if (isPrismaP2002(error)) throw new ConflictException('Playlist already liked')
      throw error
    }
  }

  /** Removes the like; unliking twice is a no-op. */
  async unlike(userId: UserEntity['id'], playlistId: PlaylistEntity['id']) {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const playlist = await tx.playlist.findFirst({
          where: { id: playlistId, deletedAt: null },
        })
        if (!playlist) throw new NotFoundException('Playlist not found')

        const deleted = await tx.userLikedPlaylist.deleteMany({
          where: { userId, playlistId },
        })
        if (deleted.count === 0) return playlist

        return await tx.playlist.update({
          where: { id: playlistId },
          data: { followersCount: { decrement: playlist.followersCount > 0 ? 1 : 0 } },
        })
      })
      await this.cache.invalidate(NS.SEARCH)
      return result
    } catch (error: unknown) {
      if (isPrismaP2025(error)) throw new NotFoundException('Playlist not found')
      throw error
    }
  }

  /** The signed-in user's playlists, each with its first few ready tracks as a preview. */
  async getMine(
    userId: UserEntity['id'],
    { page = 1, limit = 20 }: { page?: number; limit?: number } = {},
  ) {
    const pagination = normalizePagination(page, limit)
    const where = { userId, deletedAt: null }
    const [playlists, total] = await this.prisma.$transaction([
      this.prisma.playlist.findMany({
        where,
        include: {
          tracks: {
            where: { track: { processingStatus: 'READY', deletedAt: null } },
            orderBy: { position: 'asc' },
            take: MINE_PREVIEW_TRACKS,
            select: { track: { select: { id: true, title: true, cover: true } } },
          },
          _count: { select: { tracks: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      this.prisma.playlist.count({ where }),
    ])
    const data = playlists.map((playlist) => ({
      ...playlist,
      tracks: playlist.tracks.map(({ track }) => track),
    }))

    return { data, total, page: pagination.page, limit: pagination.limit }
  }

  /** Appends ready tracks to the user's own playlist. */
  async addTracks(userId: UserEntity['id'], id: PlaylistEntity['id'], dto: AddTracksDto) {
    await this.requireOwned(userId, id, 'hide')
    const uniqueTrackIds = [...new Set(dto.trackIds)]
    await this.assertTracksReady(uniqueTrackIds)
    await this.appendWithRetry(userId, id, uniqueTrackIds)
    await this.cache.invalidate(NS.SEARCH)
    return await this.getByIdPopulated(id, userId)
  }

  /** Removes the track's first occurrence from the user's own playlist. */
  async removeTrack(userId: UserEntity['id'], id: PlaylistEntity['id'], trackId: string) {
    await this.requireOwned(userId, id, 'hide')

    const membership = await this.prisma.playlistTrack.findFirst({
      where: { playlistId: id, trackId },
      orderBy: { position: 'asc' },
    })
    if (!membership) throw new NotFoundException('Track not found in playlist')

    await this.prisma.$transaction([
      this.prisma.playlistTrack.delete({ where: { id: membership.id } }),
      this.prisma.playlist.update({ where: { id }, data: { updatedAt: new Date() } }),
    ])
    await this.cache.invalidate(NS.SEARCH)
    return await this.getByIdPopulated(id, userId)
  }

  /**
   * Resolves an active playlist the user owns. Another user's playlist is a 403 for `forbid`
   * and indistinguishable from a missing one (404) for `hide`.
   */
  private async requireOwned(
    userId: UserEntity['id'],
    id: PlaylistEntity['id'],
    foreign: 'forbid' | 'hide',
  ): Promise<void> {
    const playlist = await this.prisma.playlist.findFirst({
      where: { id, deletedAt: null, ...(foreign === 'hide' ? { userId } : {}) },
      select: { userId: true },
    })
    if (!playlist) {
      throw new NotFoundException(
        foreign === 'hide' ? 'Playlist not found or not owned by user' : 'Playlist not found',
      )
    }
    if (playlist.userId !== userId) throw new ForbiddenException('You do not own this playlist')
  }

  /** Rejects the batch unless every track exists, is not deleted and finished processing. */
  private async assertTracksReady(trackIds: string[]): Promise<void> {
    const readyCount = await this.prisma.track.count({
      where: {
        id: { in: trackIds },
        processingStatus: 'READY',
        deletedAt: null,
      },
    })
    if (readyCount !== trackIds.length) {
      throw new BadRequestException('Some tracks are not available yet')
    }
  }

  private async appendWithRetry(
    userId: UserEntity['id'],
    id: PlaylistEntity['id'],
    trackIds: string[],
  ): Promise<void> {
    for (let attempt = 1; attempt <= ADD_TRACKS_ATTEMPTS; attempt += 1) {
      try {
        await this.append(userId, id, trackIds)
        return
      } catch (error: unknown) {
        // A track may sit in a playlist more than once, so a unique conflict here is always a
        // concurrent append taking the same positions; like a serialization failure, retry it.
        if (!(isPrismaP2002(error) || isPrismaP2034(error))) throw error
        if (attempt === ADD_TRACKS_ATTEMPTS) {
          throw new ConflictException('Playlist was changed concurrently, please retry')
        }
      }
    }
  }

  /** Writes the tracks after the current last position in one serializable transaction. */
  private async append(
    userId: UserEntity['id'],
    id: PlaylistEntity['id'],
    trackIds: string[],
  ): Promise<void> {
    await this.prisma.$transaction(
      async (tx) => {
        const lastTrack = await tx.playlistTrack.findFirst({
          where: { playlistId: id },
          orderBy: { position: 'desc' },
          select: { position: true },
        })
        const firstPosition = (lastTrack?.position ?? -1) + 1
        await tx.playlistTrack.createMany({
          data: trackIds.map((trackId, index) => ({
            playlistId: id,
            trackId,
            addedById: userId,
            position: firstPosition + index,
          })),
        })
        await tx.playlist.update({ where: { id }, data: { updatedAt: new Date() } })
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    )
  }
}
