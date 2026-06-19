import { PrismaService } from '@infra/prisma/prisma.service'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals'
import { Test, type TestingModule } from '@nestjs/testing'
import { prismaMock, resetPrismaMock } from '@test/mocks'
import {
  buildPlaylist,
  buildPlaylistWithTracks,
  buildPlaylistWithUser,
} from './__tests__/fixtures/playlists.fixtures'
import { PlaylistsService } from './playlists.service'

describe('PlaylistsService (int)', () => {
  let service: PlaylistsService
  let module: TestingModule

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [PlaylistsService, { provide: PrismaService, useValue: prismaMock }],
    }).compile()

    service = module.get(PlaylistsService)
  })

  afterAll(() => module.close())

  beforeEach(() => resetPrismaMock())

  it('should be defined via DI', () => {
    expect(service).toBeDefined()
  })

  it('create should call prisma.playlist.create with userId and dto', async () => {
    const playlist = buildPlaylist()
    prismaMock.playlist.create.mockResolvedValue(playlist as never)

    const result = await service.create('user-1', {
      title: 'My Playlist',
      description: undefined,
      isPublic: true,
    })

    expect(prismaMock.playlist.create).toHaveBeenCalledWith({
      data: { userId: 'user-1', title: 'My Playlist', description: undefined, isPublic: true },
    })
    expect(result).toEqual(playlist)
  })

  it('getAll should return paginated playlists with user info', async () => {
    const playlists = [buildPlaylistWithUser()]
    prismaMock.playlist.findMany.mockResolvedValue(playlists as never)

    const result = await service.getAll({ page: 1, limit: 10 })

    expect(prismaMock.playlist.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      include: { user: { select: { id: true, username: true } } },
    })
    expect(result).toEqual(playlists)
  })

  it('getById should return playlist without relations', async () => {
    const playlist = buildPlaylist()
    prismaMock.playlist.findFirst.mockResolvedValue(playlist as never)

    const result = await service.getById(playlist.id)

    expect(prismaMock.playlist.findFirst).toHaveBeenCalledWith({ where: { id: playlist.id } })
    expect(result).toEqual(playlist)
  })

  it('getByIdPopulated should return playlist with tracks and user', async () => {
    const playlist = buildPlaylistWithTracks()
    prismaMock.playlist.findFirst.mockResolvedValue(playlist as never)

    const result = await service.getByIdPopulated('playlist-1')

    expect(prismaMock.playlist.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'playlist-1' },
        include: expect.objectContaining({ tracks: true }),
      }),
    )
    expect(result).toEqual(playlist)
  })
})
