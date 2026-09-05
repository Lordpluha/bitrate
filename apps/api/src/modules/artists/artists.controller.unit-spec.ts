import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { buildArtist } from './__tests__/fixtures/artists.fixtures'
import { ArtistsController } from './artists.controller'
import type { ArtistsService } from './artists.service'

const makeServiceMock = () =>
  ({
    findAll: jest.fn(),
    findById: jest.fn(),
    findByUsername: jest.fn(),
    update: jest.fn(),
    requestDelete: jest.fn(),
  }) as unknown as jest.Mocked<ArtistsService>

describe('ArtistsController', () => {
  let controller: ArtistsController
  let service: jest.Mocked<ArtistsService>

  beforeEach(() => {
    service = makeServiceMock()
    controller = new ArtistsController(service)
  })

  it('getAll should delegate to service.findAll', async () => {
    const artists = [buildArtist()]
    service.findAll.mockResolvedValue(artists as never)

    const result = await controller.getAll(undefined, 1, 10)

    expect(service.findAll).toHaveBeenCalledWith({ limit: 10, page: 1, username: undefined })
    expect(result).toBe(artists)
  })

  it('getById should call service.findById', async () => {
    const artist = buildArtist()
    service.findById.mockResolvedValue(artist as never)

    const result = await controller.getById('artist-1')

    expect(service.findById).toHaveBeenCalledWith('artist-1')
    expect(result).toBe(artist)
  })

  it('getByUsername should call service.findByUsername', async () => {
    const artist = buildArtist()
    service.findByUsername.mockResolvedValue(artist as never)

    const result = await controller.getByUsername('artist')

    expect(service.findByUsername).toHaveBeenCalledWith('artist')
    expect(result).toBe(artist)
  })

  it('updateProfile should call service.update with artist id from request', async () => {
    const updated = buildArtist({ username: 'new-name' })
    service.update.mockResolvedValue(updated as never)
    const req = { artist: { id: 'artist-1' } } as never

    const result = await controller.updateProfile(req, 'artist-1', { username: 'new-name' })

    expect(service.update).toHaveBeenCalledWith('artist-1', { username: 'new-name' }, 'artist-1')
    expect(result).toBe(updated)
  })

  it('deleteProfile should call service.requestDelete with artist id from request', async () => {
    const deleted = buildArtist()
    service.requestDelete.mockResolvedValue(deleted as never)
    const req = { artist: { id: 'artist-1' } } as never

    const result = await controller.deleteProfile(req, 'artist-1')

    expect(service.requestDelete).toHaveBeenCalledWith('artist-1', 'artist-1')
    expect(result).toBe(deleted)
  })
})
