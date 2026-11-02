import { PassThrough, Readable } from 'node:stream'
import { finished } from 'node:stream/promises'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { BadRequestException } from '@nestjs/common'
import { buildAudioFile, buildTrack } from './__tests__/fixtures/tracks.fixtures'
import { PlaybackPacingError } from './playback-session.service'
import type { TrackPlaybackService } from './track-playback.service'
import type { TrackUploadService } from './track-upload.service'
import { TracksController } from './tracks.controller'
import type { TracksService } from './tracks.service'

jest.mock('music-metadata', () => ({ parseFile: jest.fn() }), { virtual: true })

const makeServiceMock = () =>
  ({
    findAll: jest.fn(),
    findTrackById: jest.fn(),
    findLikedTracks: jest.fn(),
    like: jest.fn(),
    unlike: jest.fn(),
  }) as unknown as jest.Mocked<TracksService>

const makeUploadServiceMock = () =>
  ({
    create: jest.fn(),
    update: jest.fn(),
  }) as unknown as jest.Mocked<TrackUploadService>

/** A source whose first read fails, as a dropped storage connection does. */
const failingStream = () =>
  new Readable({
    read() {
      this.destroy(new Error('storage connection reset'))
    },
  })

/** A writable stand-in for the Express response that records headers. */
const makeStreamResponse = () =>
  Object.assign(new PassThrough(), {
    set: jest.fn(),
    status: jest.fn().mockReturnThis(),
  })

const makePlaybackServiceMock = () =>
  ({
    openSession: jest.fn(),
    getRenditionStream: jest.fn(),
  }) as unknown as jest.Mocked<TrackPlaybackService>

describe('TracksController', () => {
  let controller: TracksController
  let service: jest.Mocked<TracksService>
  let uploadService: jest.Mocked<TrackUploadService>
  let playbackService: jest.Mocked<TrackPlaybackService>

  beforeEach(() => {
    service = makeServiceMock()
    uploadService = makeUploadServiceMock()
    playbackService = makePlaybackServiceMock()
    controller = new TracksController(service, uploadService, playbackService)
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

  it('streamRendition should close the response when the storage stream fails', async () => {
    playbackService.getRenditionStream.mockResolvedValue({
      stream: failingStream(),
      contentType: 'audio/mp4',
      contentLength: 1024,
      isPartial: false,
    } as never)
    const res = makeStreamResponse()

    await controller.streamRendition(
      'track-1',
      192,
      'signed',
      { headers: {} } as never,
      res as never,
    )

    await expect(finished(res)).rejects.toThrow('storage connection reset')
    expect(res.destroyed).toBe(true)
  })

  it('openPlaySession opens a session for the signed-in user and the given device', async () => {
    const session = { manifest: {}, token: 'signed', expiresAt: 1 }
    playbackService.openSession.mockResolvedValue(session as never)

    const result = await controller.openPlaySession(
      'track-1',
      { user: { id: 'user-1' } } as never,
      { deviceId: 'device-1' },
    )

    expect(playbackService.openSession).toHaveBeenCalledWith({
      trackId: 'track-1',
      userId: 'user-1',
      deviceId: 'device-1',
    })
    expect(result).toBe(session)
  })

  it('streamRendition hands the session token and Range to the service', async () => {
    playbackService.getRenditionStream.mockResolvedValue({
      stream: Readable.from([]),
      contentType: 'audio/mp4',
      contentLength: 708,
      isPartial: true,
      start: 0,
      end: 707,
      fileSize: 133_586,
    } as never)

    await controller.streamRendition(
      'track-1',
      192,
      'signed',
      { headers: { range: 'bytes=0-' } } as never,
      makeStreamResponse() as never,
    )

    expect(playbackService.getRenditionStream).toHaveBeenCalledWith({
      trackId: 'track-1',
      bitrate: 192,
      rangeHeader: 'bytes=0-',
      token: 'signed',
    })
  })

  it('streamRendition answers 429 with Retry-After when the session is ahead of real time', async () => {
    playbackService.getRenditionStream.mockRejectedValue(new PlaybackPacingError(7))
    const res = { set: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() }

    await controller.streamRendition(
      'track-1',
      192,
      'signed',
      { headers: {} } as never,
      res as never,
    )

    expect(res.status).toHaveBeenCalledWith(429)
    expect(res.set).toHaveBeenCalledWith({ 'Retry-After': '7' })
  })

  it('postTrack should throw BadRequestException when audio file is missing', async () => {
    const req = { artist: { id: 'artist-1' } } as never

    await expect(controller.postTrack(req, { title: 'T' } as never, {})).rejects.toThrow(
      BadRequestException,
    )
  })

  it('postTrack should call uploadService.create when audio file is present', async () => {
    const track = buildTrack()
    uploadService.create.mockResolvedValue(track as never)
    const req = { artist: { id: 'artist-1' } } as never
    const audioFile = buildAudioFile()
    const files = { audio: [audioFile] }

    const result = await controller.postTrack(req, { title: 'T' } as never, files)

    expect(uploadService.create).toHaveBeenCalledWith(
      'artist-1',
      { title: 'T' } as never,
      audioFile,
      undefined,
    )
    expect(result).toBe(track)
  })

  it('putTrack should call uploadService.update', async () => {
    const track = buildTrack()
    uploadService.update.mockResolvedValue(track as never)

    const req = { artist: { id: 'artist-1' } } as never
    const result = await controller.putTrack(req, 'track-1', { title: 'Updated' } as never, {})

    expect(uploadService.update).toHaveBeenCalledWith(
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
