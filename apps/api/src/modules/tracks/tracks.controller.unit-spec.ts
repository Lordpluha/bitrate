import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { BadRequestException } from '@nestjs/common'
import { buildAudioFile, buildTrack } from './__tests__/fixtures/tracks.fixtures'
import type { TrackPlaybackService } from './track-playback.service'
import { TracksController } from './tracks.controller'
import type { TracksService } from './tracks.service'

jest.mock('music-metadata', () => ({ parseFile: jest.fn() }), { virtual: true })

const makeServiceMock = () =>
  ({
    findAll: jest.fn(),
    findTrackById: jest.fn(),
    getTrackStream: jest.fn(),
    getHlsMasterPlaylist: jest.fn(),
    getHlsAsset: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findLikedTracks: jest.fn(),
    like: jest.fn(),
    unlike: jest.fn(),
  }) as unknown as jest.Mocked<TracksService>

const makePlaybackServiceMock = () =>
  ({
    getManifest: jest.fn(),
    getRenditionStream: jest.fn(),
  }) as unknown as jest.Mocked<TrackPlaybackService>

describe('TracksController', () => {
  let controller: TracksController
  let service: jest.Mocked<TracksService>
  let playbackService: jest.Mocked<TrackPlaybackService>

  beforeEach(() => {
    service = makeServiceMock()
    playbackService = makePlaybackServiceMock()
    controller = new TracksController(service, playbackService)
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

  it('getHlsMasterPlaylist should return the generated playlist', async () => {
    service.getHlsMasterPlaylist.mockResolvedValue('#EXTM3U\n' as never)
    const res = {
      set: jest.fn(),
      send: jest.fn().mockReturnValue('sent'),
    }

    const result = await controller.getHlsMasterPlaylist('track-1', res as never)

    expect(service.getHlsMasterPlaylist).toHaveBeenCalledWith('track-1')
    expect(res.set).toHaveBeenCalledWith(
      expect.objectContaining({ 'Content-Type': 'application/vnd.apple.mpegurl' }),
    )
    expect(result).toBe('sent')
  })

  it('getHlsAsset should pipe an authenticated segment response', async () => {
    const stream = { pipe: jest.fn().mockReturnValue('piped') }
    service.getHlsAsset.mockResolvedValue({
      stream,
      contentType: 'video/iso.segment',
      contentLength: 1024,
      immutable: true,
    } as never)
    const res = { set: jest.fn() }

    const result = await controller.getHlsAsset('track-1', 192, 'segment_00000.m4s', res as never)

    expect(service.getHlsAsset).toHaveBeenCalledWith('track-1', 192, 'segment_00000.m4s')
    expect(stream.pipe).toHaveBeenCalledWith(res)
    expect(result).toBe('piped')
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

    expect(service.create).toHaveBeenCalledWith(
      'artist-1',
      { title: 'T' } as never,
      audioFile,
      undefined,
    )
    expect(result).toBe(track)
  })

  it('putTrack should call service.update', async () => {
    const track = buildTrack()
    service.update.mockResolvedValue(track as never)

    const req = { artist: { id: 'artist-1' } } as never
    const result = await controller.putTrack(req, 'track-1', { title: 'Updated' } as never, {})

    expect(service.update).toHaveBeenCalledWith(
      'artist-1',
      'track-1',
      { title: 'Updated' } as never,
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

  it('likeTrack should call service.like with user id and track id', () => {
    const track = buildTrack()
    service.like.mockResolvedValue(track as never)
    const req = { user: { id: 'user-1' } } as never

    const result = controller.likeTrack(req, 'track-1')

    expect(service.like).toHaveBeenCalledWith('user-1', 'track-1')
    expect(result).resolves.toBe(track)
  })

  it('unlikeTrack should call service.unlike with user id and track id', () => {
    const track = buildTrack()
    service.unlike.mockResolvedValue(track as never)
    const req = { user: { id: 'user-1' } } as never

    const result = controller.unlikeTrack(req, 'track-1')

    expect(service.unlike).toHaveBeenCalledWith('user-1', 'track-1')
    expect(result).resolves.toBe(track)
  })
})
