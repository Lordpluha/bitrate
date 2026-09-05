import { CacheService } from '@infra/cache/cache.service'
import { PrismaService } from '@infra/prisma/prisma.service'
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { ForbiddenException } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import { prismaMock, resetPrismaMock } from '@test/mocks'
import { buildArtist } from './__tests__/fixtures/artists.fixtures'
import { PUBLIC_ARTIST_SELECT } from './artists.select'
import { ArtistsService } from './artists.service'

const makeCacheServiceMock = () =>
  ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    invalidate: jest.fn(),
    wrap: jest.fn().mockImplementation((...args: unknown[]) => (args[3] as () => unknown)()),
  }) as unknown as CacheService

describe('ArtistsService (int)', () => {
  let service: ArtistsService
  let module: TestingModule

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        ArtistsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: CacheService, useValue: makeCacheServiceMock() },
      ],
    }).compile()

    service = module.get(ArtistsService)
  })

  afterAll(() => module.close())

  beforeEach(() => resetPrismaMock())

  it('should be defined via DI', () => {
    expect(service).toBeDefined()
  })

  it('findAll should call findMany with pagination', async () => {
    const artists = [buildArtist()]
    prismaMock.$transaction.mockResolvedValue([artists, 1] as never)

    const result = await service.findAll({ page: 1, limit: 10 })

    expect(prismaMock.artist.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 10,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: PUBLIC_ARTIST_SELECT,
      }),
    )
    expect(result).toEqual({ data: artists, total: 1, page: 1, limit: 10 })
  })

  it('findById should project only public fields', async () => {
    const artist = buildArtist()
    prismaMock.artist.findFirst.mockResolvedValue(artist as never)

    const result = await service.findById('artist-1')

    expect(prismaMock.artist.findFirst).toHaveBeenCalledWith({
      where: { id: 'artist-1', deletedAt: null },
      select: PUBLIC_ARTIST_SELECT,
    })
    expect(result).toEqual(artist)
  })

  it('update should throw ForbiddenException when artist is not owner', async () => {
    await expect(service.update('artist-1', {}, 'other-artist')).rejects.toThrow(ForbiddenException)
  })

  it('requestDelete should throw ForbiddenException when artist is not owner', async () => {
    await expect(service.requestDelete('artist-1', 'other-artist')).rejects.toThrow(
      ForbiddenException,
    )
  })
})
