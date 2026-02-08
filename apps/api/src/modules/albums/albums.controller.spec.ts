import { beforeEach, describe, expect, it } from '@jest/globals'
import { type DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'
import { buildAlbum, buildArtist, FindAllResult } from './__tests__/fixtures/albums.fixtures'
import { AlbumsController } from './albums.controller'
import type { AlbumsService } from './albums.service'

type ArtistAuthRequestParam = Parameters<AlbumsController['createAlbum']>[0]

describe('AlbumsController', () => {
  let controller: AlbumsController
  let service: DeepMockProxy<AlbumsService>

  beforeEach(() => {
    service = mockDeep<AlbumsService>()
    mockReset(service)

    controller = new AlbumsController(service)
  })

  it('getAllAlbums should pass pagination params', async () => {
    const albums: FindAllResult = [buildAlbum()]
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
    const albums: FindAllResult = [buildAlbum()]
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
    const albums: FindAllResult = [buildAlbum()]
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

  it('createAlbum should use artist from request', async () => {
    const created = buildAlbum()
    service.create.mockResolvedValue(created)

    const req: ArtistAuthRequestParam = { artist: buildArtist() }
    const dto = { title: 'New Album', description: 'desc' }

    const result = await controller.createAlbum(req, dto)

    expect(service.create).toHaveBeenCalledWith('artist-1', dto)
    expect(dto).toEqual({ title: 'New Album', description: 'desc' })
    expect(result).toBe(created)
  })

  it('createAlbum should propagate service errors', async () => {
    const req: ArtistAuthRequestParam = { artist: buildArtist() }
    const dto = { title: 'New Album', description: 'desc' }
    service.create.mockRejectedValue(new Error('create-failed'))

    await expect(controller.createAlbum(req, dto)).rejects.toThrow('create-failed')
  })

  it('updateAlbum should use artist from request', async () => {
    const updated = buildAlbum({ title: 'Updated' })
    service.update.mockResolvedValue(updated)

    const req: ArtistAuthRequestParam = { artist: buildArtist() }
    const dto = { title: 'Updated' }

    const result = await controller.updateAlbum(req, 'album-1', dto)

    expect(service.update).toHaveBeenCalledWith('artist-1', 'album-1', dto)
    expect(dto).toEqual({ title: 'Updated' })
    expect(result).toBe(updated)
  })

  it('updateAlbum should propagate service errors', async () => {
    const req: ArtistAuthRequestParam = { artist: buildArtist() }
    const dto = { title: 'Updated' }
    service.update.mockRejectedValue(new Error('update-failed'))

    await expect(controller.updateAlbum(req, 'album-1', dto)).rejects.toThrow('update-failed')
  })

  it('deleteAlbum should use artist from request', async () => {
    const deleted = buildAlbum()
    service.delete.mockResolvedValue(deleted)

    const req: ArtistAuthRequestParam = { artist: buildArtist() }

    const result = await controller.deleteAlbum(req, 'album-1')

    expect(service.delete).toHaveBeenCalledWith('artist-1', 'album-1')
    expect(result).toBe(deleted)
  })

  it('deleteAlbum should propagate service errors', async () => {
    const req: ArtistAuthRequestParam = { artist: buildArtist() }
    service.delete.mockRejectedValue(new Error('delete-failed'))

    await expect(controller.deleteAlbum(req, 'album-1')).rejects.toThrow('delete-failed')
  })
})
