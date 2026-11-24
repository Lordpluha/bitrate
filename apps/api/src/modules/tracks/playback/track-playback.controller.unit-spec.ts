import { PassThrough, Readable } from 'node:stream'
import { finished } from 'node:stream/promises'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { buildUser } from '@modules/users/__tests__/fixtures/users.fixtures'
import { UserThrottlerGuard } from '@modules/users-auth/user-throttler.guard'
import { UserAuthGuard } from '@modules/users-auth/users-auth.guard'
import { HttpException, HttpStatus } from '@nestjs/common'
import { GUARDS_METADATA } from '@nestjs/common/constants'
import { PLAYBACK_ERRORS } from '../errors'
import { PlaybackAbuseError } from './playback-abuse'
import { PlaybackPacingError } from './playback-session.service'
import { TrackPlaybackController } from './track-playback.controller'
import type { TrackPlaybackService } from './track-playback.service'

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

describe('TrackPlaybackController', () => {
  it('throttles opening sessions per user only after the user is authenticated', () => {
    const guards: unknown[] =
      Reflect.getMetadata(GUARDS_METADATA, TrackPlaybackController.prototype.openPlaySession) ?? []

    expect(guards).toContain(UserThrottlerGuard)
    expect(guards.indexOf(UserAuthGuard)).toBeLessThan(guards.indexOf(UserThrottlerGuard))
  })

  let controller: TrackPlaybackController
  let playbackService: jest.Mocked<TrackPlaybackService>

  beforeEach(() => {
    playbackService = makePlaybackServiceMock()
    controller = new TrackPlaybackController(playbackService)
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

    const result = await controller.openPlaySession('track-1', user, { deviceId: 'device-1' }, {
      set: jest.fn(),
    } as never)

    expect(playbackService.openSession).toHaveBeenCalledWith({
      trackId: 'track-1',
      userId: 'user-1',
      deviceId: 'device-1',
    })
    expect(result).toBe(session)
  })

  it('openPlaySession answers 429 with Retry-After when the listener started too many tracks', async () => {
    playbackService.openSession.mockRejectedValue(new PlaybackAbuseError(90))
    const res = { set: jest.fn() }

    const refusal = await controller
      .openPlaySession('track-1', buildUser({ id: 'user-1' }), {}, res as never)
      .catch((error: unknown) => error)

    expect(refusal).toBeInstanceOf(HttpException)
    expect((refusal as HttpException).getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS)
    expect((refusal as HttpException).message).toBe(PLAYBACK_ERRORS.TOO_MANY_TRACKS)
    expect(res.set).toHaveBeenCalledWith('Retry-After', '90')
  })

  it('streamRendition keeps rendition bytes out of every cache', async () => {
    playbackService.getRenditionStream.mockResolvedValue({
      stream: Readable.from([]),
      contentType: 'audio/mp4',
      contentLength: 708,
      isPartial: true,
      start: 0,
      end: 707,
      fileSize: 133_586,
    } as never)
    const res = makeStreamResponse()

    await controller.streamRendition(
      'track-1',
      192,
      'signed',
      { headers: {} } as never,
      res as never,
    )

    expect(res.set).toHaveBeenCalledWith(
      expect.objectContaining({ 'Cache-Control': 'private, no-store, no-transform' }),
    )
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
})
