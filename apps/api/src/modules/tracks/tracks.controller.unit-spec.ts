import { PassThrough, Readable } from 'node:stream'
import { finished } from 'node:stream/promises'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { buildUser } from '@modules/users/__tests__/fixtures/users.fixtures'
import { ForbiddenException } from '@nestjs/common'
import { buildTrack } from './__tests__/fixtures/tracks.fixtures'
import { PlaybackPacingError } from './playback-session.service'
import type { TrackPlaybackService } from './track-playback.service'
import { TracksController } from './tracks.controller'
import type { TracksService } from './tracks.service'

const makeServiceMock = () =>
  ({
    findAll: jest.fn(),
    findTrackById: jest.fn(),
    findLikedTracks: jest.fn(),
    like: jest.fn(),
    unlike: jest.fn(),
  }) as unknown as jest.Mocked<TracksService>

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
    const user = buildUser({ id: 'user-1' })

    const result = await controller.openPlaySession('track-1', user, { deviceId: 'device-1' })

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

  it.each(['postTrack', 'putTrack'] as const)(
    '%s rejects direct artist catalogue writes',
    (method) => {
      expect(() => controller[method]()).toThrow(ForbiddenException)
    },
  )

  it('getLikedTracks should call service.findLikedTracks with user id from request', () => {
    const tracks = [buildTrack()]
    service.findLikedTracks.mockResolvedValue(tracks as never)
    const user = buildUser({ id: 'user-1' })

    const result = controller.getLikedTracks(user, 1, 10)

    expect(service.findLikedTracks).toHaveBeenCalledWith('user-1', { page: 1, limit: 10 })
    expect(result).resolves.toBe(tracks)
  })

  it('likeTrack should call service.like with user id and track id', () => {
    const track = buildTrack()
    service.like.mockResolvedValue(track as never)
    const user = buildUser({ id: 'user-1' })

    const result = controller.likeTrack(user, 'track-1')

    expect(service.like).toHaveBeenCalledWith('user-1', 'track-1')
    expect(result).resolves.toBe(track)
  })

  it('unlikeTrack should call service.unlike with user id and track id', () => {
    const track = buildTrack()
    service.unlike.mockResolvedValue(track as never)
    const user = buildUser({ id: 'user-1' })

    const result = controller.unlikeTrack(user, 'track-1')

    expect(service.unlike).toHaveBeenCalledWith('user-1', 'track-1')
    expect(result).resolves.toBe(track)
  })
})
