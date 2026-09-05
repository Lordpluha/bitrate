import type { CacheService } from '@infra/cache/cache.service'
import { beforeEach, describe, expect, it } from '@jest/globals'
import { ConflictException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { type DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'
import {
  buildPlaylist,
  buildPlaylistWithTracks,
  buildPlaylistWithUser,
} from './__tests__/fixtures/playlists.fixtures'
import { PlaylistsService } from './playlists.service'

const mockInteractiveTransaction = (prisma: PrismaMock) =>
  prisma.$transaction.mockImplementation((callback: unknown) =>
    (callback as (tx: PrismaMock) => unknown)(prisma),
  )

describe('PlaylistsService', () => {
  let service: PlaylistsService
  let prisma: PrismaMock
  let cache: DeepMockProxy<CacheService>

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    cache = mockDeep<CacheService>()
    mockReset(cache)
    service = new PlaylistsService(prisma, cache)
  })

  it('create should create playlist with cover', async () => {
    const created = buildPlaylist({ title: 'New Playlist' })
    prisma.playlist.create.mockResolvedValue(created)

    const result = await service.create('user-1', { title: 'New Playlist', description: 'desc' })

    expect(prisma.playlist.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        cover: '',
        title: 'New Playlist',
        description: 'desc',
      },
    })
    expect(result).toBe(created)
  })

  it('getAll should use pagination defaults', async () => {
    const playlists = [buildPlaylistWithUser()]
    prisma.$transaction.mockResolvedValue([playlists, 1] as never)

    const result = await service.getAll({})

    expect(prisma.playlist.findMany).toHaveBeenCalledWith({
      where: { isPublic: true, deletedAt: null },
      skip: 0,
      take: 10,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    })
    expect(result).toEqual({ data: playlists, total: 1, page: 1, limit: 10 })
  })

  it('getAll should use pagination params', async () => {
    const playlists = [buildPlaylistWithUser()]
    prisma.$transaction.mockResolvedValue([playlists, 1] as never)

    const result = await service.getAll({ page: 2, limit: 5 })

    expect(prisma.playlist.findMany).toHaveBeenCalledWith({
      where: { isPublic: true, deletedAt: null },
      skip: 5,
      take: 5,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    })
    expect(result).toEqual({ data: playlists, total: 1, page: 2, limit: 5 })
  })

  it('getById should call prisma', async () => {
    const playlist = buildPlaylist()
    prisma.playlist.findFirst.mockResolvedValue(playlist)

    const result = await service.getById('playlist-1')

    expect(prisma.playlist.findFirst).toHaveBeenCalledWith({
      where: { id: 'playlist-1', deletedAt: null },
    })
    expect(result).toEqual(playlist)
  })

  it('getByIdPopulated should include tracks', async () => {
    const playlist = buildPlaylistWithTracks()
    prisma.playlist.findFirst.mockResolvedValue(playlist)

    const result = await service.getByIdPopulated('playlist-1')

    expect(prisma.playlist.findFirst).toHaveBeenCalledWith({
      where: { id: 'playlist-1', deletedAt: null, isPublic: true },
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
    expect(result).toEqual(playlist)
  })

  it('getByIdPopulated should allow owner private playlists', async () => {
    const playlist = buildPlaylistWithTracks({ isPublic: false })
    prisma.playlist.findFirst.mockResolvedValue(playlist)

    const result = await service.getByIdPopulated('playlist-1', 'user-1')

    expect(prisma.playlist.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'playlist-1',
        deletedAt: null,
        OR: [{ isPublic: true }, { userId: 'user-1' }],
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
    expect(result).toEqual(playlist)
  })

  it('update should update playlist with user', async () => {
    const updated = buildPlaylist({ title: 'Updated' })
    prisma.playlist.update.mockResolvedValue(updated)
    prisma.playlist.findFirst.mockResolvedValue(buildPlaylist({ userId: 'user-1' }))

    const result = await service.update('user-1', 'playlist-1', { title: 'Updated' })

    expect(prisma.playlist.update).toHaveBeenCalledWith({
      where: { id: 'playlist-1' },
      data: { title: 'Updated' },
    })
    expect(result).toBe(updated)
  })

  it('update should pass optional description', async () => {
    const updated = buildPlaylist({ title: 'Updated', description: 'desc' })
    prisma.playlist.update.mockResolvedValue(updated)
    prisma.playlist.findFirst.mockResolvedValue(buildPlaylist({ userId: 'user-1' }))

    const result = await service.update('user-1', 'playlist-1', {
      title: 'Updated',
      description: 'desc',
    })

    expect(prisma.playlist.update).toHaveBeenCalledWith({
      where: { id: 'playlist-1' },
      data: { title: 'Updated', description: 'desc' },
    })
    expect(result).toBe(updated)
  })

  it('delete should delete playlist for user', async () => {
    const deleted = buildPlaylist()
    prisma.playlist.update.mockResolvedValue(deleted)
    prisma.playlist.findFirst.mockResolvedValue(buildPlaylist({ userId: 'user-1' }))

    const result = await service.delete('user-1', 'playlist-1')

    expect(prisma.playlist.update).toHaveBeenCalledWith({
      where: { id: 'playlist-1' },
      data: { deletedAt: expect.any(Date) },
    })
    expect(result).toBe(deleted)
  })

  it('like should create an explicit playlist like', async () => {
    const playlist = buildPlaylist()
    mockInteractiveTransaction(prisma)
    prisma.playlist.findFirst.mockResolvedValue(playlist)
    prisma.userLikedPlaylist.findUnique.mockResolvedValue(null)
    prisma.userLikedPlaylist.create.mockResolvedValue({} as never)
    prisma.playlist.update.mockResolvedValue(playlist)

    const result = await service.like('user-1', 'playlist-1')

    expect(prisma.userLikedPlaylist.create).toHaveBeenCalledWith({
      data: { userId: 'user-1', playlistId: 'playlist-1' },
    })
    expect(prisma.playlist.update).toHaveBeenCalledWith({
      where: { id: 'playlist-1' },
      data: { followersCount: { increment: 1 } },
    })
    expect(result).toBe(playlist)
  })

  it('like should return 409 when a concurrent request already created the like', async () => {
    const playlist = buildPlaylist()
    mockInteractiveTransaction(prisma)
    prisma.playlist.findFirst.mockResolvedValue(playlist)
    prisma.userLikedPlaylist.findUnique.mockResolvedValue(null)
    prisma.userLikedPlaylist.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: 'test',
      }) as never,
    )

    await expect(service.like('user-1', 'playlist-1')).rejects.toThrow(ConflictException)
  })

  it('unlike should delete the explicit playlist like', async () => {
    const playlist = buildPlaylist({ followersCount: 1 })
    mockInteractiveTransaction(prisma)
    prisma.playlist.findFirst.mockResolvedValue(playlist)
    prisma.userLikedPlaylist.deleteMany.mockResolvedValue({ count: 1 })
    prisma.playlist.update.mockResolvedValue(playlist)

    const result = await service.unlike('user-1', 'playlist-1')

    expect(prisma.userLikedPlaylist.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', playlistId: 'playlist-1' },
    })
    expect(prisma.playlist.update).toHaveBeenCalledWith({
      where: { id: 'playlist-1' },
      data: { followersCount: { decrement: 1 } },
    })
    expect(result).toBe(playlist)
  })

  it('serializes append positions and removes duplicate input track IDs', async () => {
    const playlist = buildPlaylistWithTracks({ userId: 'user-1' })
    mockInteractiveTransaction(prisma)
    prisma.playlist.findFirst.mockResolvedValue(playlist)
    prisma.track.count.mockResolvedValue(2)
    prisma.playlistTrack.findFirst.mockResolvedValue({ position: 3 } as never)
    prisma.playlistTrack.createMany.mockResolvedValue({ count: 2 })
    prisma.playlist.update.mockResolvedValue(playlist)

    await service.addTracks('user-1', 'playlist-1', {
      trackIds: [
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000002',
      ],
    })

    expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    })
    expect(prisma.playlistTrack.createMany).toHaveBeenCalledWith({
      data: [
        {
          playlistId: 'playlist-1',
          trackId: '00000000-0000-0000-0000-000000000001',
          addedById: 'user-1',
          position: 4,
        },
        {
          playlistId: 'playlist-1',
          trackId: '00000000-0000-0000-0000-000000000002',
          addedById: 'user-1',
          position: 5,
        },
      ],
    })
  })

  it('addTracks should return 409 after exhausting retries on a unique-constraint race', async () => {
    const playlist = buildPlaylistWithTracks({ userId: 'user-1' })
    prisma.playlist.findFirst.mockResolvedValue(playlist)
    prisma.track.count.mockResolvedValue(1)
    prisma.$transaction.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: 'test',
      }) as never,
    )

    await expect(
      service.addTracks('user-1', 'playlist-1', {
        trackIds: ['00000000-0000-0000-0000-000000000001'],
      }),
    ).rejects.toThrow(ConflictException)
    expect(prisma.$transaction).toHaveBeenCalledTimes(3)
  })
})
