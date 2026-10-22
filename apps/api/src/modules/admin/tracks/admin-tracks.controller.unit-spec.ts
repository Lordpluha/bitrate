import { PassThrough, Readable } from 'node:stream'
import { describe, expect, it, jest } from '@jest/globals'
import type { Request, Response } from 'express'

/** `TrackUploadService` pulls in `music-metadata`, which Jest cannot resolve; mock it virtually. */
jest.mock('music-metadata', () => ({ parseFile: jest.fn() }), { virtual: true })

import type { AdminTrackAudioService, TrackAudioStream } from './admin-track-audio.service'
import type { AdminTrackListService } from './admin-track-list.service'
import { AdminTracksController } from './admin-tracks.controller'
import type { AdminTracksService } from './admin-tracks.service'

const TRACK_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'

/** A writable stand-in for the Express response, with the two setters the handler calls. */
const makeResponse = () => {
  const res = new PassThrough()
  return Object.assign(res, {
    status: jest.fn(() => res),
    set: jest.fn(() => res),
  })
}

/** A storage stream that stays open until the test ends it. */
const idleSource = () =>
  new Readable({
    read() {
      // Never pushes: the test decides how the transfer ends.
    },
  })

/** Resolves on `close` — unlike `events.once`, without rejecting on the `error` before it. */
const closeOf = (stream: NodeJS.EventEmitter) =>
  new Promise<void>((resolve) => stream.once('close', () => resolve()))

const makeAudio = (stream: Readable): TrackAudioStream => ({
  stream,
  fileSize: 4,
  contentType: 'audio/mp4',
  bitrate: 320,
  start: 0,
  end: 3,
  contentLength: 4,
  isPartial: false,
})

describe('AdminTracksController.streamAudio', () => {
  it('tears the response down when the storage stream fails mid-transfer', async () => {
    const source = idleSource()
    const trackAudio = {
      stream: jest.fn(async () => makeAudio(source)),
    } as unknown as AdminTrackAudioService
    const controller = new AdminTracksController(
      {} as AdminTrackListService,
      {} as AdminTracksService,
      trackAudio,
    )
    const res = makeResponse()

    await controller.streamAudio(
      TRACK_ID,
      undefined,
      { headers: {} } as Request,
      res as unknown as Response,
    )
    const closed = closeOf(res)
    source.destroy(new Error('storage connection reset'))
    await closed

    expect(res.destroyed).toBe(true)
  })

  it('releases the storage stream when the client goes away', async () => {
    const source = idleSource()
    const trackAudio = {
      stream: jest.fn(async () => makeAudio(source)),
    } as unknown as AdminTrackAudioService
    const controller = new AdminTracksController(
      {} as AdminTrackListService,
      {} as AdminTracksService,
      trackAudio,
    )
    const res = makeResponse()

    await controller.streamAudio(
      TRACK_ID,
      undefined,
      { headers: {} } as Request,
      res as unknown as Response,
    )
    const closed = closeOf(source)
    res.destroy()
    await closed

    expect(source.destroyed).toBe(true)
  })
})
