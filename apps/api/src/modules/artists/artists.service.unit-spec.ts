import type { CacheService } from '@infra/cache/cache.service'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { buildArtist } from './__tests__/fixtures/artists.fixtures'
import { PUBLIC_ARTIST_SELECT } from './artists.select'
import { ArtistsService } from './artists.service'

const makeCacheMock = () =>
  ({
    get: jest.fn().mockResolvedValue(null as never),
    set: jest.fn().mockResolvedValue(undefined as never),
    del: jest.fn().mockResolvedValue(undefined as never),
    invalidate: jest.fn().mockResolvedValue(undefined as never),
    wrap: jest.fn().mockImplementation((...args: unknown[]) => (args[3] as () => unknown)()),
  }) as unknown as CacheService

describe('ArtistsService', () => {
  let service: ArtistsService
  let prisma: PrismaMock

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    service = new ArtistsService(prisma, makeCacheMock())
  })

  it('register should create artist omitting password', async () => {
    const created = buildArtist()
    prisma.artist.create.mockResolvedValue(created)

    const result = await service.register({
      email: 'artist@example.com',
      password: 'pass',
      username: 'artist',
    })

    expect(prisma.artist.create).toHaveBeenCalledWith({
      data: { password: 'pass', username: 'artist', email: 'artist@example.com' },
      select: { id: true, email: true, username: true },
    })
    expect(result).toBe(created)
  })

  it('register should persist the accepted legal and Artist Agreement revisions', async () => {
    prisma.artist.create.mockResolvedValue(buildArtist())
    const acceptedAt = new Date('2026-10-01T12:00:00Z')

    await service.register({
      email: 'artist@example.com',
      password: 'pass',
      username: 'artist',
      legalVersion: '2026-10-01',
      legalAcceptedAt: acceptedAt,
      artistAgreementVersion: '2026-10-01',
      artistAgreementAcceptedAt: acceptedAt,
    })

    expect(prisma.artist.create).toHaveBeenCalledWith({
      data: {
        password: 'pass',
        username: 'artist',
        email: 'artist@example.com',
        legalVersion: '2026-10-01',
        legalAcceptedAt: acceptedAt,
        artistAgreementVersion: '2026-10-01',
        artistAgreementAcceptedAt: acceptedAt,
      },
      select: { id: true, email: true, username: true },
    })
  })

  it('findAll should use defaults when no params', async () => {
    const artists = [buildArtist()]
    prisma.$transaction.mockResolvedValue([artists, 1] as never)

    const result = await service.findAll({})

    expect(prisma.artist.findMany).toHaveBeenCalledWith({
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: 0,
      take: 10,
      where: { deletedAt: null },
      select: PUBLIC_ARTIST_SELECT,
    })
    expect(result).toEqual({ data: artists, total: 1, page: 1, limit: 10 })
  })

  it('findAll should filter by username case-insensitively', async () => {
    const artists = [buildArtist()]
    prisma.$transaction.mockResolvedValue([artists, 1] as never)

    const result = await service.findAll({ page: 2, limit: 5, username: 'art' })

    expect(prisma.artist.findMany).toHaveBeenCalledWith({
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: 5,
      take: 5,
      where: {
        deletedAt: null,
        username: { contains: 'art', mode: 'insensitive' },
      },
      select: PUBLIC_ARTIST_SELECT,
    })
    expect(result).toEqual({ data: artists, total: 1, page: 2, limit: 5 })
  })

  it('findByUsername should ignore soft-deleted artists', async () => {
    const artist = buildArtist()
    prisma.artist.findFirst.mockResolvedValue(artist)

    const result = await service.findByUsername('artist')

    expect(prisma.artist.findFirst).toHaveBeenCalledWith({
      where: { username: 'artist', deletedAt: null },
      select: PUBLIC_ARTIST_SELECT,
    })
    expect(result).toBe(artist)
  })

  it('update should throw ForbiddenException when id differs from currentArtistId', async () => {
    await expect(service.update('artist-1', {}, 'other-id')).rejects.toThrow(ForbiddenException)
  })

  it('update should update artist when authorized', async () => {
    const updated = buildArtist({ username: 'updated' })
    prisma.artist.update.mockResolvedValue(updated)

    const result = await service.update('artist-1', { username: 'updated' }, 'artist-1')

    expect(prisma.artist.update).toHaveBeenCalledWith({
      where: { id: 'artist-1' },
      data: { username: 'updated' },
      select: PUBLIC_ARTIST_SELECT,
    })
    expect(result).toBe(updated)
  })

  it('requestDelete should throw ForbiddenException when id differs from currentArtistId', async () => {
    await expect(service.requestDelete('artist-1', 'other-id')).rejects.toThrow(ForbiddenException)
  })

  it('requestDelete should soft-delete artist when authorized', async () => {
    const deleted = buildArtist()
    prisma.$transaction.mockResolvedValue([deleted, { count: 1 }] as never)

    const result = await service.requestDelete('artist-1', 'artist-1')

    expect(prisma.artist.update).toHaveBeenCalledWith({
      where: { id: 'artist-1' },
      data: { deletedAt: expect.any(Date) },
      select: PUBLIC_ARTIST_SELECT,
    })
    expect(prisma.artistSession.deleteMany).toHaveBeenCalledWith({
      where: { artistId: 'artist-1' },
    })
    expect(result).toBe(deleted)
  })

  it('findByEmail should ignore soft-deleted artists', async () => {
    const artist = buildArtist()
    prisma.artist.findFirst.mockResolvedValue(artist)

    const result = await service.findByEmail('artist@example.com')

    expect(prisma.artist.findFirst).toHaveBeenCalledWith({
      where: { email: 'artist@example.com', deletedAt: null },
      select: { id: true },
    })
    expect(result).toBe(artist)
  })

  it('findById should ignore soft-deleted artists', async () => {
    const artist = buildArtist()
    prisma.artist.findFirst.mockResolvedValue(artist)

    const result = await service.findById('artist-1')

    expect(prisma.artist.findFirst).toHaveBeenCalledWith({
      where: { id: 'artist-1', deletedAt: null },
      select: PUBLIC_ARTIST_SELECT,
    })
    expect(result).toBe(artist)
  })

  describe('findTopTracks', () => {
    const artistId = 'artist-1'
    const playable = {
      deletedAt: null,
      processingStatus: 'READY' as const,
      publishedAt: { not: null },
      OR: [{ artistId }, { artists: { some: { artistId } } }],
    }

    it('ranks the artist tracks, featured ones included, by listening', async () => {
      prisma.artist.findFirst.mockResolvedValue({ id: artistId } as never)
      prisma.track.findMany.mockResolvedValue([] as never)

      await service.findTopTracks(artistId, 5)

      expect(prisma.track.findMany).toHaveBeenCalledWith({
        where: playable,
        orderBy: [
          { popularity: 'desc' },
          { playCount: 'desc' },
          { releaseDate: { sort: 'desc', nulls: 'last' } },
          { id: 'asc' },
        ],
        take: 5,
        include: { artist: { select: { id: true, username: true, avatar: true } } },
      })
    })

    it('caps the limit between 1 and 50', async () => {
      prisma.artist.findFirst.mockResolvedValue({ id: artistId } as never)
      prisma.track.findMany.mockResolvedValue([] as never)

      await service.findTopTracks(artistId, 500)
      await service.findTopTracks(artistId, 0)

      expect(prisma.track.findMany.mock.calls.map(([args]) => args?.take)).toEqual([50, 1])
    })

    it('throws NotFound for an unknown or deleted artist', async () => {
      prisma.artist.findFirst.mockResolvedValue(null)

      await expect(service.findTopTracks(artistId)).rejects.toBeInstanceOf(NotFoundException)
      expect(prisma.artist.findFirst).toHaveBeenCalledWith({
        where: { id: artistId, deletedAt: null },
        select: { id: true },
      })
    })
  })

  describe('findPlaylists', () => {
    const artistId = 'artist-1'

    it('lists public playlists that contain the artist playable tracks, most followed first', async () => {
      prisma.artist.findFirst.mockResolvedValue({ id: artistId } as never)
      prisma.$transaction.mockResolvedValue([[], 0] as never)

      const result = await service.findPlaylists(artistId, 2, 5)

      const where = {
        isPublic: true,
        deletedAt: null,
        tracks: {
          some: {
            track: {
              deletedAt: null,
              processingStatus: 'READY' as const,
              publishedAt: { not: null },
              OR: [{ artistId }, { artists: { some: { artistId } } }],
            },
          },
        },
      }
      expect(prisma.playlist.findMany).toHaveBeenCalledWith({
        where,
        orderBy: [{ followersCount: 'desc' }, { updatedAt: 'desc' }, { id: 'asc' }],
        skip: 5,
        take: 5,
        include: {
          user: { select: { id: true, username: true, avatar: true } },
          _count: { select: { tracks: true } },
        },
      })
      expect(prisma.playlist.count).toHaveBeenCalledWith({ where })
      expect(result).toEqual({ data: [], total: 0, page: 2, limit: 5 })
    })

    it('throws NotFound for an unknown artist', async () => {
      prisma.artist.findFirst.mockResolvedValue(null)

      await expect(service.findPlaylists(artistId)).rejects.toBeInstanceOf(NotFoundException)
    })
  })
})
