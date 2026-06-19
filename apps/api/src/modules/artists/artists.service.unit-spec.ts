import { beforeEach, describe, expect, it } from '@jest/globals'
import { UnauthorizedException } from '@nestjs/common'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { buildArtist } from './__tests__/fixtures/artists.fixtures'
import { ArtistsService } from './artists.service'

describe('ArtistsService', () => {
  let service: ArtistsService
  let prisma: PrismaMock

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    service = new ArtistsService(prisma)
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
    prisma.artist.findMany.mockResolvedValue(artists)

    const result = await service.findAll({})

    expect(prisma.artist.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      where: undefined,
      omit: { password: true, email: true },
    })
    expect(result).toBe(artists)
  })

  it('findAll should filter by username case-insensitively', async () => {
    const artists = [buildArtist()]
    prisma.artist.findMany.mockResolvedValue(artists)

    const result = await service.findAll({ page: 2, limit: 5, username: 'art' })

    expect(prisma.artist.findMany).toHaveBeenCalledWith({
      skip: 5,
      take: 5,
      where: { username: { contains: 'art', mode: 'insensitive' } },
      omit: { password: true, email: true },
    })
    expect(result).toBe(artists)
  })

  it('findByUsername should call findUnique with omit', async () => {
    const artist = buildArtist()
    prisma.artist.findUnique.mockResolvedValue(artist)

    const result = await service.findByUsername('artist')

    expect(prisma.artist.findUnique).toHaveBeenCalledWith({
      where: { username: 'artist' },
      omit: { password: true, email: true },
    })
    expect(result).toBe(artist)
  })

  it('update should throw UnauthorizedException when id differs from currentArtistId', async () => {
    await expect(service.update('artist-1', {}, 'other-id')).rejects.toThrow(UnauthorizedException)
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

  it('requestDelete should throw UnauthorizedException when id differs from currentArtistId', async () => {
    await expect(service.requestDelete('artist-1', 'other-id')).rejects.toThrow(
      UnauthorizedException,
    )
  })

  it('requestDelete should delete artist when authorized', async () => {
    const deleted = buildArtist()
    prisma.artist.delete.mockResolvedValue(deleted)

    const result = await service.requestDelete('artist-1', 'artist-1')

    expect(prisma.artist.delete).toHaveBeenCalledWith({
      where: { id: 'artist-1' },
      omit: { password: true, email: true },
    })
    expect(result).toBe(deleted)
  })

  it('findByEmail should call findUnique omitting password', async () => {
    const artist = buildArtist()
    prisma.artist.findUnique.mockResolvedValue(artist)

    const result = await service.findByEmail('artist@example.com')

    expect(prisma.artist.findUnique).toHaveBeenCalledWith({
      where: { email: 'artist@example.com' },
      omit: { password: true },
    })
    expect(result).toBe(artist)
  })

  it('findById should call findUnique omitting password and email', async () => {
    const artist = buildArtist()
    prisma.artist.findUnique.mockResolvedValue(artist)

    const result = await service.findById('artist-1')

    expect(prisma.artist.findUnique).toHaveBeenCalledWith({
      where: { id: 'artist-1' },
      omit: { password: true, email: true },
    })
    expect(result).toBe(artist)
  })
})
