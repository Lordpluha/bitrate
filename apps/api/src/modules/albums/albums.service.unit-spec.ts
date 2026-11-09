import { beforeEach, describe, expect, it } from '@jest/globals'
import { makeCacheMock, type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { buildAlbum } from './__tests__/fixtures/albums.fixtures'
import { AlbumsService } from './albums.service'
import { ALBUM_TRACKS_INCLUDE } from './orm'

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
      where: {
        deletedAt: null,
        publishedAt: { not: null },
        title: { contains: 'rock', mode: 'insensitive' },
      },
      include: ALBUM_TRACKS_INCLUDE,
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
      where: {
        deletedAt: null,
        publishedAt: { not: null },
        title: { contains: 'RoCk', mode: 'insensitive' },
      },
      include: ALBUM_TRACKS_INCLUDE,
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
      where: { deletedAt: null, publishedAt: { not: null } },
      include: ALBUM_TRACKS_INCLUDE,
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
      where: { deletedAt: null, publishedAt: { not: null } },
      include: ALBUM_TRACKS_INCLUDE,
    })
    expect(result).toEqual({ data: albums, total: 1, page: 1, limit: 10 })
  })

  it('getById should include tracks', async () => {
    const album = buildAlbumWithTracks()
    prisma.album.findFirst.mockResolvedValue(album)

    const result = await service.getById('album-1')

    expect(prisma.album.findFirst).toHaveBeenCalledWith({
      where: { id: 'album-1', deletedAt: null, publishedAt: { not: null } },
      include: ALBUM_TRACKS_INCLUDE,
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
      where: { id: 'album-unknown', deletedAt: null, publishedAt: { not: null } },
      include: ALBUM_TRACKS_INCLUDE,
    })
    expect(result).toBeNull()
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

  it('findLiked should return the user saved albums, newest like first', async () => {
    const album = buildAlbumWithTracks()
    const likedAt = new Date('2026-10-01T00:00:00.000Z')
    prisma.$transaction.mockResolvedValue([[{ album, createdAt: likedAt }], 1] as never)

    const result = await service.findLiked('user-1', { page: 2, limit: 5 })

    expect(prisma.userLikedAlbum.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', album: { deletedAt: null, publishedAt: { not: null } } },
      include: { album: { include: ALBUM_TRACKS_INCLUDE } },
      orderBy: [{ createdAt: 'desc' }, { albumId: 'desc' }],
      skip: 5,
      take: 5,
    })
    expect(prisma.userLikedAlbum.count).toHaveBeenCalledWith({
      where: { userId: 'user-1', album: { deletedAt: null, publishedAt: { not: null } } },
    })
    expect(result).toEqual({
      data: [{ ...album, tracks: [], likedAt }],
      total: 1,
      page: 2,
      limit: 5,
    })
  })

  it('findLiked should use default pagination', async () => {
    prisma.$transaction.mockResolvedValue([[], 0] as never)

    const result = await service.findLiked('user-1', {})

    expect(prisma.userLikedAlbum.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 10 }),
    )
    expect(result).toEqual({ data: [], total: 0, page: 1, limit: 10 })
  })

  describe('findForTracks', () => {
    const TRACK_A = '01a10c5c-0000-7000-8000-00000000000a'
    const TRACK_B = '01a10c5c-0000-7000-8000-00000000000b'
    const row = (
      trackId: string,
      id: string,
      title: string,
      releaseDate: string | null,
      createdAt: string,
    ) => ({
      trackId,
      album: {
        id,
        title,
        releaseDate: releaseDate ? new Date(releaseDate) : null,
        createdAt: new Date(createdAt),
      },
    })

    it('answers every requested track, with its earliest album or null', async () => {
      prisma.albumTrack.findMany.mockResolvedValue([
        row(TRACK_A, 'deluxe', 'Glass Cities (Deluxe)', '2026-06-01', '2026-06-01'),
        row(TRACK_A, 'original', 'Glass Cities', '2025-01-10', '2025-01-10'),
      ] as never)

      const result = await service.findForTracks([TRACK_A, TRACK_B])

      expect(result).toEqual({
        data: [
          { trackId: TRACK_A, album: { id: 'original', title: 'Glass Cities' } },
          { trackId: TRACK_B, album: null },
        ],
      })
    })

    it('reads only live albums of the requested tracks', async () => {
      prisma.albumTrack.findMany.mockResolvedValue([] as never)

      await service.findForTracks([TRACK_A])

      expect(prisma.albumTrack.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            trackId: { in: [TRACK_A] },
            album: { deletedAt: null, publishedAt: { not: null } },
          },
        }),
      )
    })

    it('falls back to the creation date when an album has no release date', async () => {
      prisma.albumTrack.findMany.mockResolvedValue([
        row(TRACK_A, 'later', 'Later', '2026-03-01', '2026-03-01'),
        row(TRACK_A, 'undated', 'Undated', null, '2025-12-01'),
      ] as never)

      const { data } = await service.findForTracks([TRACK_A])

      expect(data[0]?.album?.id).toBe('undated')
    })
  })
})
