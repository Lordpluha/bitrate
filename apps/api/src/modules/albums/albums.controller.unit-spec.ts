import { beforeEach, describe, expect, it } from '@jest/globals'
import { type DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'
import { buildAlbum, type FindAllResult } from './__tests__/fixtures/albums.fixtures'
import { AlbumsController } from './albums.controller'
import type { AlbumsService } from './albums.service'

describe('AlbumsController', () => {
  let controller: AlbumsController
  let service: DeepMockProxy<AlbumsService>

  beforeEach(() => {
    service = mockDeep<AlbumsService>()
    mockReset(service)

    controller = new AlbumsController(service)
  })

  it('getAllAlbums should pass pagination params', async () => {
    const albums: FindAllResult = { data: [buildAlbum()], total: 1, page: 2, limit: 5 }
    service.findAll.mockResolvedValue(albums)

    const result = await controller.getAllAlbums(2, 5, 'rock')

    expect(service.findAll).toHaveBeenCalledWith({
      limit: 5,
      page: 2,
      title: 'rock',
    })
    expect(result).toBe(albums)
  })

  it('getAllAlbums should pass undefined for missing pagination params', async () => {
    const albums: FindAllResult = { data: [buildAlbum()], total: 1, page: 1, limit: 10 }
    service.findAll.mockResolvedValue(albums)

    const result = await controller.getAllAlbums(undefined, undefined, undefined)

    expect(service.findAll).toHaveBeenCalledWith({
      limit: undefined,
      page: undefined,
      title: undefined,
    })
    expect(result).toBe(albums)
  })

  it('getAllAlbums should pass pagination without title', async () => {
    const albums: FindAllResult = { data: [buildAlbum()], total: 1, page: 1, limit: 10 }
    service.findAll.mockResolvedValue(albums)

    const result = await controller.getAllAlbums(1, 10, undefined)

    expect(service.findAll).toHaveBeenCalledWith({
      limit: 10,
      page: 1,
      title: undefined,
    })
    expect(result).toBe(albums)
  })

  it('getById should call service', async () => {
    const album = buildAlbum()
    service.getById.mockResolvedValue(album)

    const result = await controller.getById('album-1')

    expect(service.getById).toHaveBeenCalledWith('album-1')
    expect(result).toBe(album)
  })

  it('getById should propagate service errors', async () => {
    const error = new Error('boom')
    service.getById.mockRejectedValue(error)

    await expect(controller.getById('album-1')).rejects.toThrow('boom')
  })
})
