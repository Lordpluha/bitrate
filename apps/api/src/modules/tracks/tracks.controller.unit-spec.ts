import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { BadRequestException } from '@nestjs/common'
import { buildAudioFile, buildTrack } from './__tests__/fixtures/tracks.fixtures'
import { TracksController } from './tracks.controller'
import type { TracksService } from './tracks.service'

const makeServiceMock = () =>
  ({
    findAll: jest.fn(),
    findTrackById: jest.fn(),
    getTrackStream: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findLikedTracks: jest.fn(),
  }) as unknown as jest.Mocked<TracksService>

describe('TracksController', () => {
  let controller: TracksController
  let service: jest.Mocked<TracksService>

  beforeEach(() => {
    service = makeServiceMock()
    controller = new TracksController(service)
  })

  it('getAll should delegate to service.findAll', () => {
    const expected = { data: [buildTrack()], meta: { total: 1, page: 1, limit: 10, lastPage: 1 } }
    service.findAll.mockResolvedValue(expected as never)

    const result = controller.getAll(1, 10, undefined)

    expect(service.findAll).toHaveBeenCalledWith({ limit: 10, page: 1, title: undefined })
    expect(result).resolves.toBe(expected)
  })

  it('getById should call service.findTrackById', () => {
    const track = buildTrack()
    service.findTrackById.mockResolvedValue(track as never)

    const result = controller.getById('track-1')

    expect(service.findTrackById).toHaveBeenCalledWith('track-1')
    expect(result).resolves.toBe(track)
  })

  it('postTrack should throw BadRequestException when audio file is missing', async () => {
    const req = { artist: { id: 'artist-1' } } as never

    await expect(controller.postTrack(req, { title: 'T' } as never, {})).rejects.toThrow(
      BadRequestException,
    )
  })

  it('postTrack should call service.create when audio file is present', async () => {
    const track = buildTrack()
    service.create.mockResolvedValue(track as never)
    const req = { artist: { id: 'artist-1' } } as never
    const audioFile = buildAudioFile()
    const files = { audio: [audioFile] }

    const result = await controller.postTrack(req, { title: 'T' } as never, files)

    expect(service.create).toHaveBeenCalledWith('artist-1', { title: 'T' }, audioFile, undefined)
    expect(result).toBe(track)
  })

  it('putTrack should call service.update', async () => {
    const track = buildTrack()
    service.update.mockResolvedValue(track as never)

    const result = await controller.putTrack('track-1', { title: 'Updated' } as never, {})

    expect(service.update).toHaveBeenCalledWith(
      'track-1',
      { title: 'Updated' },
      undefined,
      undefined,
    )
    expect(result).toBe(track)
  })

  it('getLikedTracks should call service.findLikedTracks with user id from request', () => {
    const tracks = [buildTrack()]
    service.findLikedTracks.mockResolvedValue(tracks as never)
    const req = { user: { id: 'user-1' } } as never

    const result = controller.getLikedTracks(req, 1, 10)

    expect(service.findLikedTracks).toHaveBeenCalledWith('user-1', { page: 1, limit: 10 })
    expect(result).resolves.toBe(tracks)
  })
})
