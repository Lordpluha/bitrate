import { beforeEach, describe, expect, it } from '@jest/globals'
import { PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import {
  buildPlaylist,
  buildPlaylistWithTracks,
  buildPlaylistWithUser,
} from './__tests__/fixtures/playlists.fixtures'
import { PlaylistsService } from './playlists.service'

describe('PlaylistsService', () => {
  let service: PlaylistsService
  let prisma: PrismaMock

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    service = new PlaylistsService(prisma)
  })

  it('create should create playlist with cover', async () => {
    const created = buildPlaylist({ title: 'New Playlist' })
    prisma.playlist.create.mockResolvedValue(created)

    const result = await service.create('user-1', { title: 'New Playlist', description: 'desc' })

    expect(prisma.playlist.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        cover: '',
        title: 'New Playlist',
        description: 'desc',
      },
    })
    expect(result).toBe(created)
  })

  it('getAll should use pagination defaults', async () => {
    const playlists = [buildPlaylistWithUser()]
    prisma.playlist.findMany.mockResolvedValue(playlists)

    const result = await service.getAll({})

    expect(prisma.playlist.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    })
    expect(result).toBe(playlists)
  })

  it('getAll should use pagination params', async () => {
    const playlists = [buildPlaylistWithUser()]
    prisma.playlist.findMany.mockResolvedValue(playlists)

    const result = await service.getAll({ page: 2, limit: 5 })

    expect(prisma.playlist.findMany).toHaveBeenCalledWith({
      skip: 5,
      take: 5,
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    })
    expect(result).toBe(playlists)
  })

  it('getById should call prisma', async () => {
    const playlist = buildPlaylist()
    prisma.playlist.findUniqueOrThrow.mockResolvedValue(playlist)

    const result = await service.getById('playlist-1')

    expect(prisma.playlist.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: 'playlist-1' },
    })
    expect(result).toBe(playlist)
  })

  it('getByIdPopulated should include tracks', async () => {
    const playlist = buildPlaylistWithTracks()
    prisma.playlist.findUniqueOrThrow.mockResolvedValue(playlist)

    const result = await service.getByIdPopulated('playlist-1')

    expect(prisma.playlist.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: 'playlist-1' },
      include: { tracks: true },
    })
    expect(result).toBe(playlist)
  })

  it('update should update playlist with user', async () => {
    const updated = buildPlaylist({ title: 'Updated' })
    prisma.playlist.update.mockResolvedValue(updated)

    const result = await service.update('user-1', 'playlist-1', { title: 'Updated' })

    expect(prisma.playlist.update).toHaveBeenCalledWith({
      where: { id: 'playlist-1' },
      data: {
        title: 'Updated',
        userId: 'user-1',
      },
    })
    expect(result).toBe(updated)
  })

  it('update should pass optional description', async () => {
    const updated = buildPlaylist({ title: 'Updated', description: 'desc' })
    prisma.playlist.update.mockResolvedValue(updated)

    const result = await service.update('user-1', 'playlist-1', {
      title: 'Updated',
      description: 'desc',
    })

    expect(prisma.playlist.update).toHaveBeenCalledWith({
      where: { id: 'playlist-1' },
      data: {
        title: 'Updated',
        description: 'desc',
        userId: 'user-1',
      },
    })
    expect(result).toBe(updated)
  })

  it('delete should delete playlist for user', async () => {
    const deleted = buildPlaylist()
    prisma.playlist.delete.mockResolvedValue(deleted)

    const result = await service.delete('user-1', 'playlist-1')

    expect(prisma.playlist.delete).toHaveBeenCalledWith({
      where: {
        id: 'playlist-1',
        userId: 'user-1',
      },
    })
    expect(result).toBe(deleted)
  })
})
