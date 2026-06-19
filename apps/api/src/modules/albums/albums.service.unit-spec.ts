import { beforeEach, describe, expect, it } from '@jest/globals'
import { NotFoundException } from '@nestjs/common'
import { PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { buildAlbum, buildArtist } from './__tests__/fixtures/albums.fixtures'
import { AlbumsService } from './albums.service'

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
    service = new AlbumsService(prisma)
  })

  it('findAll should use pagination and title filter', async () => {
    const albums = [buildAlbumWithTracks()]
    prisma.album.findMany.mockResolvedValue(albums)

    const result = await service.findAll({ page: 2, limit: 5, title: 'rock' })

    expect(prisma.album.findMany).toHaveBeenCalledWith({
      skip: 5,
      take: 5,
      where: { title: { contains: 'rock', mode: 'insensitive' } },
      include: { tracks: true },
    })
    expect(result).toBe(albums)
  })

  it('findAll should keep title filter case-insensitive', async () => {
    const albums = [buildAlbumWithTracks()]
    prisma.album.findMany.mockResolvedValue(albums)

    const result = await service.findAll({ page: 1, limit: 10, title: 'RoCk' })

    expect(prisma.album.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      where: { title: { contains: 'RoCk', mode: 'insensitive' } },
      include: { tracks: true },
    })
    expect(result).toBe(albums)
  })

  it('findAll should use defaults when params missing', async () => {
    const albums = [buildAlbumWithTracks()]
    prisma.album.findMany.mockResolvedValue(albums)

    const result = await service.findAll({})

    expect(prisma.album.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      where: undefined,
      include: { tracks: true },
    })
    expect(result).toBe(albums)
  })

  it('findAll should ignore empty title filter', async () => {
    const albums = [buildAlbumWithTracks()]
    prisma.album.findMany.mockResolvedValue(albums)

    const result = await service.findAll({ page: 1, limit: 10, title: '' })

    expect(prisma.album.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      where: undefined,
      include: { tracks: true },
    })
    expect(result).toBe(albums)
  })

  it('getById should include tracks', async () => {
    const album = buildAlbumWithTracks()
    prisma.album.findFirst.mockResolvedValue(album)

    const result = await service.getById('album-1')

    expect(prisma.album.findFirst).toHaveBeenCalledWith({
      where: { id: 'album-1' },
      include: { tracks: true },
    })
    expect(result).toBe(album)
  })

  it('getById should return null when album not found', async () => {
    prisma.album.findFirst.mockResolvedValue(null)

    const result = await service.getById('album-unknown')

    expect(prisma.album.findFirst).toHaveBeenCalledWith({
      where: { id: 'album-unknown' },
      include: { tracks: true },
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
      where: { id: 'album-1', artistId: 'artist-1' },
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

  it('delete should remove album', async () => {
    prisma.album.findFirst.mockResolvedValue(buildAlbum())
    const deleted = buildAlbum()
    prisma.album.delete.mockResolvedValue(deleted)

    const result = await service.delete('artist-1', 'album-1')

    expect(prisma.album.findFirst).toHaveBeenCalledWith({
      where: { id: 'album-1', artistId: 'artist-1' },
    })
    expect(prisma.album.delete).toHaveBeenCalledWith({
      where: { id: 'album-1' },
      omit: { artistId: true },
    })
    expect(result).toBe(deleted)
  })
})
