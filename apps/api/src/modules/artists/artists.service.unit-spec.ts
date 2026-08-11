import type { CacheService } from '@infra/cache/cache.service'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { ForbiddenException } from '@nestjs/common'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { buildArtist } from './__tests__/fixtures/artists.fixtures'
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
      omit: { password: true },
    })
    expect(result).toBe(created)
  })

  it('findAll should use defaults when no params', async () => {
    const artists = [buildArtist()]
    prisma.$transaction.mockResolvedValue([artists, 1] as never)

    const result = await service.findAll({})

    expect(prisma.artist.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      where: { deletedAt: null },
      omit: { password: true, email: true },
    })
    expect(result).toEqual({ data: artists, total: 1, page: 1, limit: 10 })
  })

  it('findAll should filter by username case-insensitively', async () => {
    const artists = [buildArtist()]
    prisma.$transaction.mockResolvedValue([artists, 1] as never)

    const result = await service.findAll({ page: 2, limit: 5, username: 'art' })

    expect(prisma.artist.findMany).toHaveBeenCalledWith({
      skip: 5,
      take: 5,
      where: {
        deletedAt: null,
        username: { contains: 'art', mode: 'insensitive' },
      },
      omit: { password: true, email: true },
    })
    expect(result).toEqual({ data: artists, total: 1, page: 2, limit: 5 })
  })

  it('findByUsername should ignore soft-deleted artists', async () => {
    const artist = buildArtist()
    prisma.artist.findFirst.mockResolvedValue(artist)

    const result = await service.findByUsername('artist')

    expect(prisma.artist.findFirst).toHaveBeenCalledWith({
      where: { username: 'artist', deletedAt: null },
      omit: { password: true, email: true },
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
      omit: { password: true, email: true },
    })
    expect(result).toBe(updated)
  })

  it('requestDelete should throw ForbiddenException when id differs from currentArtistId', async () => {
    await expect(service.requestDelete('artist-1', 'other-id')).rejects.toThrow(ForbiddenException)
  })

  it('requestDelete should soft-delete artist when authorized', async () => {
    const deleted = buildArtist()
    prisma.artist.update.mockResolvedValue(deleted)

    const result = await service.requestDelete('artist-1', 'artist-1')

    expect(prisma.artist.update).toHaveBeenCalledWith({
      where: { id: 'artist-1' },
      data: { deletedAt: expect.any(Date) },
      omit: { password: true, email: true },
    })
    expect(result).toBe(deleted)
  })

  it('findByEmail should ignore soft-deleted artists', async () => {
    const artist = buildArtist()
    prisma.artist.findFirst.mockResolvedValue(artist)

    const result = await service.findByEmail('artist@example.com')

    expect(prisma.artist.findFirst).toHaveBeenCalledWith({
      where: { email: 'artist@example.com', deletedAt: null },
      omit: { password: true },
    })
    expect(result).toBe(artist)
  })

  it('findById should ignore soft-deleted artists', async () => {
    const artist = buildArtist()
    prisma.artist.findFirst.mockResolvedValue(artist)

    const result = await service.findById('artist-1')

    expect(prisma.artist.findFirst).toHaveBeenCalledWith({
      where: { id: 'artist-1', deletedAt: null },
      omit: { password: true, email: true },
    })
    expect(result).toBe(artist)
  })
})
