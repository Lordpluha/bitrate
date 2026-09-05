import { CacheService } from '@infra/cache/cache.service'
import { PrismaService } from '@infra/prisma/prisma.service'
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { buildArtist } from '@modules/artists/__tests__/fixtures/artists.fixtures'
import { Test, type TestingModule } from '@nestjs/testing'
import { prismaMock, resetPrismaMock } from '@test/mocks'
import { buildAlbum } from './__tests__/fixtures/albums.fixtures'
import { AlbumsService } from './albums.service'

const makeCacheServiceMock = () =>
  ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    invalidate: jest.fn(),
    wrap: jest.fn().mockImplementation((...args: unknown[]) => (args[3] as () => unknown)()),
  }) as unknown as CacheService

describe('AlbumsService (int)', () => {
  let service: AlbumsService
  let module: TestingModule

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        AlbumsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: CacheService, useValue: makeCacheServiceMock() },
      ],
    }).compile()

    service = module.get(AlbumsService)
  })

  afterAll(() => module.close())

  beforeEach(() => resetPrismaMock())

  it('should be defined via DI', () => {
    expect(service).toBeDefined()
  })

  it('findAll should call prisma.album.findMany with correct args', async () => {
    const albums = [{ ...buildAlbum(), tracks: [] }]
    prismaMock.$transaction.mockResolvedValue([albums, 1] as never)

    const result = await service.findAll({ page: 1, limit: 10 })

    expect(prismaMock.album.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 10,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      }),
    )
    expect(result).toEqual({
      data: albums.map(({ tracks: _tracks, ...album }) => ({ ...album, tracks: [] })),
      total: 1,
      page: 1,
      limit: 10,
    })
  })

  it('getById should load only ready tracks', async () => {
    const album = { ...buildAlbum(), tracks: [] }
    prismaMock.album.findFirst.mockResolvedValue(album as never)

    const result = await service.getById(album.id)

    expect(prismaMock.album.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: album.id, deletedAt: null } }),
    )
    expect(result).toEqual({ ...album, tracks: [] })
  })

  it('create should throw NotFoundException when artist not found', async () => {
    prismaMock.artist.findUnique.mockResolvedValue(null)

    await expect(
      service.create('artist-1', { title: 'New Album', description: undefined }),
    ).rejects.toThrow('Artist not found')
  })

  it('create should create album when artist exists', async () => {
    const artist = buildArtist()
    const album = buildAlbum()
    prismaMock.artist.findUnique.mockResolvedValue(artist as never)
    prismaMock.album.create.mockResolvedValue(album as never)

    const result = await service.create('artist-1', {
      title: 'Album Title',
      description: undefined,
    })

    expect(prismaMock.album.create).toHaveBeenCalled()
    expect(result).toEqual(album)
  })
})
