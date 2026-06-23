import { beforeEach, describe, expect, it } from '@jest/globals'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { buildArtist } from './__tests__/fixtures/artists.fixtures'
import { ArtistsPrivateService } from './artists.private.service'

describe('ArtistsPrivateService', () => {
  let service: ArtistsPrivateService
  let prisma: PrismaMock

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    service = new ArtistsPrivateService(prisma)
  })

  it('register should create artist without omit', async () => {
    const created = buildArtist()
    prisma.artist.create.mockResolvedValue(created)

    const result = await service.register({
      email: 'artist@example.com',
      password: 'pass',
      username: 'artist',
    })

    expect(prisma.artist.create).toHaveBeenCalledWith({
      data: { password: 'pass', username: 'artist', email: 'artist@example.com' },
    })
    expect(result).toBe(created)
  })

  it('login should return artist with full data when credentials match', async () => {
    const artist = buildArtist()
    prisma.artist.findFirst.mockResolvedValue(artist)

    const result = await service.login({
      email: 'artist@example.com',
      password: 'pass',
      username: 'artist',
    })

    expect(prisma.artist.findFirst).toHaveBeenCalledWith({
      where: { email: 'artist@example.com', password: 'pass' },
    })
    expect(result).toBe(artist)
  })

  it('login should throw when artist not found', async () => {
    prisma.artist.findFirst.mockResolvedValue(null)

    await expect(
      service.login({ email: 'x@example.com', password: 'pass', username: 'artist' }),
    ).rejects.toThrow('Invalid credentials')
  })

  it('findAll should use defaults and not omit fields', async () => {
    const artists = [buildArtist()]
    prisma.artist.findMany.mockResolvedValue(artists)

    const result = await service.findAll({})

    expect(prisma.artist.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      where: undefined,
    })
    expect(result).toBe(artists)
  })

  it('findAll should filter by username', async () => {
    const artists = [buildArtist()]
    prisma.artist.findMany.mockResolvedValue(artists)

    await service.findAll({ page: 2, limit: 5, username: 'art' })

    expect(prisma.artist.findMany).toHaveBeenCalledWith({
      skip: 5,
      take: 5,
      where: { username: { contains: 'art', mode: 'insensitive' } },
    })
  })

  it('update should call prisma.artist.update without omit', async () => {
    const updated = buildArtist({ username: 'updated' })
    prisma.artist.update.mockResolvedValue(updated)

    const result = await service.update('artist-1', { username: 'updated' })

    expect(prisma.artist.update).toHaveBeenCalledWith({
      where: { id: 'artist-1' },
      data: { username: 'updated' },
    })
    expect(result).toBe(updated)
  })

  it('delete should call prisma.artist.delete', async () => {
    const deleted = buildArtist()
    prisma.artist.delete.mockResolvedValue(deleted)

    const result = await service.delete('artist-1')

    expect(prisma.artist.delete).toHaveBeenCalledWith({ where: { id: 'artist-1' } })
    expect(result).toBe(deleted)
  })

  it('findById should call findUnique without omit', async () => {
    const artist = buildArtist()
    prisma.artist.findUnique.mockResolvedValue(artist)

    const result = await service.findById('artist-1')

    expect(prisma.artist.findUnique).toHaveBeenCalledWith({ where: { id: 'artist-1' } })
    expect(result).toBe(artist)
  })

  it('findByEmail should call findUnique without omit', async () => {
    const artist = buildArtist()
    prisma.artist.findUnique.mockResolvedValue(artist)

    const result = await service.findByEmail('artist@example.com')

    expect(prisma.artist.findUnique).toHaveBeenCalledWith({
      where: { email: 'artist@example.com' },
    })
    expect(result).toBe(artist)
  })
})
