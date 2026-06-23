import { beforeEach, describe, expect, it } from '@jest/globals'
import type { Request } from 'express'
import { type DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'
import {
  buildPlaylistWithTracks,
  buildPlaylistWithUser,
  buildUser,
  type FindAllResult,
} from './__tests__/fixtures/playlists.fixtures'
import { PlaylistsController } from './playlists.controller'
import type { PlaylistsService } from './playlists.service'

describe('PlaylistsController', () => {
  let controller: PlaylistsController
  let service: DeepMockProxy<PlaylistsService>

  beforeEach(() => {
    service = mockDeep<PlaylistsService>()
    mockReset(service)

    controller = new PlaylistsController(service)
  })

  it('getAll should pass pagination params', async () => {
    const playlists: FindAllResult = [buildPlaylistWithUser()]
    service.getAll.mockResolvedValue(playlists)

    const result = await controller.getAll(2, 5)

    expect(service.getAll).toHaveBeenCalledWith({
      limit: 5,
      page: 2,
    })
    expect(result).toBe(playlists)
  })

  it('getAll should pass undefined for missing pagination params', async () => {
    const playlists: FindAllResult = [buildPlaylistWithUser()]
    service.getAll.mockResolvedValue(playlists)

    const result = await controller.getAll(undefined, undefined)

    expect(service.getAll).toHaveBeenCalledWith({
      limit: undefined,
      page: undefined,
    })
    expect(result).toBe(playlists)
  })

  it('getById should call service', async () => {
    const playlist = buildPlaylistWithTracks()
    service.getByIdPopulated.mockResolvedValue(playlist)

    const result = await controller.getById('playlist-1')

    expect(service.getByIdPopulated).toHaveBeenCalledWith('playlist-1')
    expect(result).toBe(playlist)
  })

  it('getById should propagate service errors', async () => {
    service.getByIdPopulated.mockRejectedValue(new Error('boom'))

    await expect(controller.getById('playlist-1')).rejects.toThrow('boom')
  })

  it('post should use user from request', async () => {
    const created = buildPlaylistWithTracks()
    service.create.mockResolvedValue(created)

    const req = { user: buildUser() } as Request & { user: ReturnType<typeof buildUser> }
    const dto = { title: 'New Playlist', description: 'desc' }

    const result = await controller.post(req, dto)

    expect(service.create).toHaveBeenCalledWith('user-1', dto)
    expect(dto).toEqual({ title: 'New Playlist', description: 'desc' })
    expect(result).toBe(created)
  })

  it('post should propagate service errors', async () => {
    const req = { user: buildUser() } as Request & { user: ReturnType<typeof buildUser> }
    const dto = { title: 'New Playlist', description: 'desc' }
    service.create.mockRejectedValue(new Error('create-failed'))

    await expect(controller.post(req, dto)).rejects.toThrow('create-failed')
  })

  it('update should use user from request', async () => {
    const updated = buildPlaylistWithTracks({ title: 'Updated' })
    service.update.mockResolvedValue(updated)

    const req = { user: buildUser() } as Request & { user: ReturnType<typeof buildUser> }
    const dto = { title: 'Updated', description: 'desc' }

    const result = await controller.update(req, 'playlist-1', dto)

    expect(service.update).toHaveBeenCalledWith('user-1', 'playlist-1', dto)
    expect(dto).toEqual({ title: 'Updated', description: 'desc' })
    expect(result).toBe(updated)
  })

  it('update should propagate service errors', async () => {
    const req = { user: buildUser() } as Request & { user: ReturnType<typeof buildUser> }
    const dto = { title: 'Updated' }
    service.update.mockRejectedValue(new Error('update-failed'))

    await expect(controller.update(req, 'playlist-1', dto)).rejects.toThrow('update-failed')
  })
})
