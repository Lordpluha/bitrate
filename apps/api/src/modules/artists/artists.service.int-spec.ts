import { PrismaService } from '@infra/prisma/prisma.service'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals'
import { UnauthorizedException } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import { prismaMock, resetPrismaMock } from '@test/mocks'
import { buildArtist } from './__tests__/fixtures/artists.fixtures'
import { ArtistsService } from './artists.service'

describe('ArtistsService (int)', () => {
  let service: ArtistsService
  let module: TestingModule

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [ArtistsService, { provide: PrismaService, useValue: prismaMock }],
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
    prismaMock.artist.findMany.mockResolvedValue(artists as never)

    const result = await service.findAll({ page: 1, limit: 10 })

    expect(prismaMock.artist.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      where: undefined,
      omit: { password: true, email: true },
    })
    expect(result).toEqual(artists)
  })

  it('findById should call findUnique omitting email and password', async () => {
    const artist = buildArtist()
    prismaMock.artist.findUnique.mockResolvedValue(artist as never)

    const result = await service.findById('artist-1')

    expect(prismaMock.artist.findUnique).toHaveBeenCalledWith({
      where: { id: 'artist-1' },
      omit: { password: true, email: true },
    })
    expect(result).toEqual(artist)
  })

  it('update should throw UnauthorizedException when artist is not owner', async () => {
    await expect(service.update('artist-1', {}, 'other-artist')).rejects.toThrow(
      UnauthorizedException,
    )
  })

  it('requestDelete should throw UnauthorizedException when artist is not owner', async () => {
    await expect(service.requestDelete('artist-1', 'other-artist')).rejects.toThrow(
      UnauthorizedException,
    )
  })
})
