import type { CacheService } from '@infra/cache/cache.service'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { NotFoundException } from '@nestjs/common'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { buildAlbum, buildArtist } from './__tests__/fixtures/albums.fixtures'
import { AlbumsService } from './albums.service'

const makeCacheMock = () =>
  ({
    get: jest.fn().mockResolvedValue(null as never),
    set: jest.fn().mockResolvedValue(undefined as never),
    del: jest.fn().mockResolvedValue(undefined as never),
    invalidate: jest.fn().mockResolvedValue(undefined as never),
    wrap: jest.fn().mockImplementation((...args: unknown[]) => (args[3] as () => unknown)()),
  }) as unknown as CacheService

type AlbumModel = Awaited<ReturnType<PrismaMock['album']['create']>>
type AlbumWithTracks = AlbumModel & { tracks: unknown[] }

const buildAlbumWithTracks = (overrides: Partial<AlbumWithTracks> = {}): AlbumWithTracks => ({
  ...buildAlbum(),
  tracks: [],
  ...overrides,
})

describe('AlbumsService', () => {
  let service: AlbumsService
  let prisma: PrismaMock

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    service = new AlbumsService(prisma, makeCacheMock())
  })

  it('findAll should use pagination and title filter', async () => {
    const albums = [buildAlbumWithTracks()]
    prisma.$transaction.mockResolvedValue([albums, 1] as never)

    const result = await service.findAll({ page: 2, limit: 5, title: 'rock' })

    expect(prisma.album.findMany).toHaveBeenCalledWith({
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: 5,
      take: 5,
      where: { deletedAt: null, title: { contains: 'rock', mode: 'insensitive' } },
      include: {
        tracks: {
          where: { track: { processingStatus: 'READY', deletedAt: null } },
          include: { track: true },
          orderBy: [{ discNumber: 'asc' }, { trackNumber: 'asc' }],
        },
      },
    })
    expect(result).toEqual({ data: albums, total: 1, page: 2, limit: 5 })
  })

  it('findAll should keep title filter case-insensitive', async () => {
    const albums = [buildAlbumWithTracks()]
    prisma.$transaction.mockResolvedValue([albums, 1] as never)

    const result = await service.findAll({ page: 1, limit: 10, title: 'RoCk' })

    expect(prisma.album.findMany).toHaveBeenCalledWith({
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: 0,
      take: 10,
      where: { deletedAt: null, title: { contains: 'RoCk', mode: 'insensitive' } },
      include: {
        tracks: {
          where: { track: { processingStatus: 'READY', deletedAt: null } },
          include: { track: true },
          orderBy: [{ discNumber: 'asc' }, { trackNumber: 'asc' }],
        },
      },
    })
    expect(result).toEqual({ data: albums, total: 1, page: 1, limit: 10 })
  })

  it('findAll should use defaults when params missing', async () => {
    const albums = [buildAlbumWithTracks()]
    prisma.$transaction.mockResolvedValue([albums, 1] as never)

    const result = await service.findAll({})

    expect(prisma.album.findMany).toHaveBeenCalledWith({
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: 0,
      take: 10,
      where: { deletedAt: null },
      include: {
        tracks: {
          where: { track: { processingStatus: 'READY', deletedAt: null } },
          include: { track: true },
          orderBy: [{ discNumber: 'asc' }, { trackNumber: 'asc' }],
        },
      },
    })
    expect(result).toEqual({ data: albums, total: 1, page: 1, limit: 10 })
  })

  it('findAll should ignore empty title filter', async () => {
    const albums = [buildAlbumWithTracks()]
    prisma.$transaction.mockResolvedValue([albums, 1] as never)

    const result = await service.findAll({ page: 1, limit: 10, title: '' })

    expect(prisma.album.findMany).toHaveBeenCalledWith({
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: 0,
      take: 10,
      where: { deletedAt: null },
      include: {
        tracks: {
          where: { track: { processingStatus: 'READY', deletedAt: null } },
          include: { track: true },
          orderBy: [{ discNumber: 'asc' }, { trackNumber: 'asc' }],
        },
      },
    })
    expect(result).toEqual({ data: albums, total: 1, page: 1, limit: 10 })
  })

  it('getById should include tracks', async () => {
    const album = buildAlbumWithTracks()
    prisma.album.findFirst.mockResolvedValue(album)

    const result = await service.getById('album-1')

    expect(prisma.album.findFirst).toHaveBeenCalledWith({
      where: { id: 'album-1', deletedAt: null },
      include: {
        tracks: {
          where: { track: { processingStatus: 'READY', deletedAt: null } },
          include: { track: true },
          orderBy: [{ discNumber: 'asc' }, { trackNumber: 'asc' }],
        },
      },
    })
    expect(result).toEqual(album)
  })

  it('getById should expose the track id, not the membership row id', async () => {
    const album = buildAlbumWithTracks({
      tracks: [
        {
          id: 'album-track-row-1',
          albumId: 'album-1',
          trackId: 'track-1',
          trackNumber: 3,
          discNumber: 1,
          track: { id: 'track-1', title: 'Down 2 Wait', trackNumber: 99 },
        },
      ],
    })
    prisma.album.findFirst.mockResolvedValue(album)

    const result = await service.getById('album-1')
    const [track] = (result?.tracks ?? []) as { id: string; trackNumber: number }[]

    expect(track?.id).toBe('track-1')
    expect(track?.trackNumber).toBe(3)
  })

  it('getById should return null when album not found', async () => {
    prisma.album.findFirst.mockResolvedValue(null)

    const result = await service.getById('album-unknown')

    expect(prisma.album.findFirst).toHaveBeenCalledWith({
      where: { id: 'album-unknown', deletedAt: null },
      include: {
        tracks: {
          where: { track: { processingStatus: 'READY', deletedAt: null } },
          include: { track: true },
          orderBy: [{ discNumber: 'asc' }, { trackNumber: 'asc' }],
        },
      },
    })
    expect(result).toBeNull()
  })

  it('create should throw when artist not found', async () => {
    prisma.artist.findUnique.mockResolvedValue(null)

    await expect(
      service.create('artist-1', { title: 'New Album', description: 'desc' }),
    ).rejects.toBeInstanceOf(NotFoundException)
  })

  it('create should create album for artist', async () => {
    prisma.artist.findUnique.mockResolvedValue(buildArtist())
    const created = buildAlbum({ title: 'New Album' })
    prisma.album.create.mockResolvedValue(created)

    const result = await service.create('artist-1', { title: 'New Album' })

    expect(prisma.album.create).toHaveBeenCalledWith({
      data: {
        artistId: 'artist-1',
        title: 'New Album',
      },
    })
    expect(result).toBe(created)
  })

  it('create should pass optional description', async () => {
    prisma.artist.findUnique.mockResolvedValue(buildArtist())
    const created = buildAlbum({ title: 'New Album', description: 'desc' })
    prisma.album.create.mockResolvedValue(created)

    const result = await service.create('artist-1', {
      title: 'New Album',
      description: 'desc',
    })

    expect(prisma.album.create).toHaveBeenCalledWith({
      data: {
        artistId: 'artist-1',
        title: 'New Album',
        description: 'desc',
      },
    })
    expect(result).toBe(created)
  })

  it('create should allow undefined description', async () => {
    prisma.artist.findUnique.mockResolvedValue(buildArtist())
    const created = buildAlbum({ title: 'New Album', description: null })
    prisma.album.create.mockResolvedValue(created)

    const result = await service.create('artist-1', {
      title: 'New Album',
      description: undefined,
    })

    expect(prisma.album.create).toHaveBeenCalledWith({
      data: {
        artistId: 'artist-1',
        title: 'New Album',
        description: undefined,
      },
    })
    expect(result).toBe(created)
  })

  it('update should throw when album not found', async () => {
    prisma.album.findFirst.mockResolvedValue(null)

    await expect(service.update('artist-1', 'album-1', { title: 'Updated' })).rejects.toThrow(
      'Album not found or does not belong to the artist',
    )
  })

  it('update should update album', async () => {
    prisma.album.findFirst.mockResolvedValue(buildAlbum())
    const updated = buildAlbum({ title: 'Updated' })
    prisma.album.update.mockResolvedValue(updated)

    const result = await service.update('artist-1', 'album-1', { title: 'Updated' })

    expect(prisma.album.findFirst).toHaveBeenCalledWith({
      where: { id: 'album-1', artistId: 'artist-1', deletedAt: null },
    })
    expect(prisma.album.update).toHaveBeenCalledWith({
      where: { id: 'album-1' },
      data: { title: 'Updated' },
    })
    expect(result).toBe(updated)
  })

  it('update should pass description when provided', async () => {
    prisma.album.findFirst.mockResolvedValue(buildAlbum())
    const updated = buildAlbum({ title: 'Updated', description: 'new desc' })
    prisma.album.update.mockResolvedValue(updated)

    const result = await service.update('artist-1', 'album-1', {
      title: 'Updated',
      description: 'new desc',
    })

    expect(prisma.album.update).toHaveBeenCalledWith({
      where: { id: 'album-1' },
      data: { title: 'Updated', description: 'new desc' },
    })
    expect(result).toBe(updated)
  })

  it('delete should throw when album not found', async () => {
    prisma.album.findFirst.mockResolvedValue(null)

    await expect(service.delete('artist-1', 'album-1')).rejects.toThrow(
      'Album not found or does not belong to the artist',
    )
  })

  it('delete should soft-delete album', async () => {
    prisma.album.findFirst.mockResolvedValue(buildAlbum())
    const deleted = buildAlbum()
    prisma.album.update.mockResolvedValue(deleted)

    const result = await service.delete('artist-1', 'album-1')

    expect(prisma.album.findFirst).toHaveBeenCalledWith({
      where: { id: 'album-1', artistId: 'artist-1', deletedAt: null },
    })
    expect(prisma.album.update).toHaveBeenCalledWith({
      where: { id: 'album-1' },
      data: { deletedAt: expect.any(Date) },
      omit: { artistId: true },
    })
    expect(result).toBe(deleted)
  })

  it('like should upsert an explicit album like', async () => {
    const album = buildAlbum()
    prisma.album.findFirst.mockResolvedValue(album)
    prisma.userLikedAlbum.upsert.mockResolvedValue({} as never)

    const result = await service.like('user-1', 'album-1')

    expect(prisma.userLikedAlbum.upsert).toHaveBeenCalledWith({
      where: { userId_albumId: { userId: 'user-1', albumId: 'album-1' } },
      update: {},
      create: { userId: 'user-1', albumId: 'album-1' },
    })
    expect(result).toBe(album)
  })

  it('unlike should delete the explicit album like', async () => {
    const album = buildAlbum()
    prisma.album.findFirst.mockResolvedValue(album)
    prisma.userLikedAlbum.deleteMany.mockResolvedValue({ count: 1 })

    const result = await service.unlike('user-1', 'album-1')

    expect(prisma.userLikedAlbum.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', albumId: 'album-1' },
    })
    expect(result).toBe(album)
  })
})
