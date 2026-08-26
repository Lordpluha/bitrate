import { PassThrough, Readable } from 'node:stream'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { WsUserAuthGuard } from '@modules/users-auth/users-auth.ws.guard'
import type { Server } from 'socket.io'
import { buildTrack } from './__tests__/fixtures/tracks.fixtures'
import { AudioGateway } from './audio.gateway'
import { TrackStreamingService } from './track-streaming.service'
import { TracksService } from './tracks.service'

jest.mock('music-metadata', () => ({ parseFile: jest.fn() }), { virtual: true })

const makeTracksServiceMock = () =>
  ({
    findTrackById: jest.fn(),
  }) as unknown as jest.Mocked<TracksService>

const makeStreamingServiceMock = () =>
  ({
    getTrackAudioStream: jest.fn(),
  }) as unknown as jest.Mocked<TrackStreamingService>

const makeWsGuardMock = () =>
  ({
    canActivate: jest.fn(),
  }) as unknown as jest.Mocked<WsUserAuthGuard>

const makeServerMock = () =>
  ({
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
  }) as unknown as jest.Mocked<Server>

const makeSocket = (userId?: string, id = 'socket-1') => {
  const socket = {
    id,
    userId,
    disconnect: jest.fn(),
    join: jest.fn(),
    emit: jest.fn(),
    timeout: jest.fn(),
    emitWithAck: jest.fn().mockResolvedValue(undefined as never),
  }
  socket.timeout.mockReturnValue(socket as never)
  return socket
}

describe('AudioGateway', () => {
  it('should expose runtime constructor metadata for Nest dependency injection', () => {
    expect(Reflect.getMetadata('design:paramtypes', AudioGateway)).toEqual([
      TracksService,
      TrackStreamingService,
      WsUserAuthGuard,
    ])
  })

  let gateway: AudioGateway
  let tracksService: jest.Mocked<TracksService>
  let streamingService: jest.Mocked<TrackStreamingService>
  let wsGuard: jest.Mocked<WsUserAuthGuard>

  beforeEach(() => {
    tracksService = makeTracksServiceMock()
    streamingService = makeStreamingServiceMock()
    wsGuard = makeWsGuardMock()
    gateway = new AudioGateway(tracksService, streamingService, wsGuard)
    gateway.server = makeServerMock() as never
  })

  describe('handleConnection', () => {
    it('should disconnect client when authentication fails', async () => {
      wsGuard.canActivate.mockRejectedValue(new Error('Unauthorized') as never)
      const client = makeSocket()

      await gateway.handleConnection(client as never)

      expect(client.disconnect).toHaveBeenCalled()
    })

    it('should disconnect when userId is missing after auth', async () => {
      wsGuard.canActivate.mockResolvedValue(true as never)
      const client = makeSocket(undefined)

      await gateway.handleConnection(client as never)

      expect(client.disconnect).toHaveBeenCalled()
    })

    it('should register session and join room on successful connect', async () => {
      wsGuard.canActivate.mockResolvedValue(true as never)
      const client = makeSocket('user-1')

      await gateway.handleConnection(client as never)

      expect(client.join).toHaveBeenCalledWith('user_user-1')
      expect(client.emit).toHaveBeenCalledWith('trackState', { isPlaying: false })
    })
  })

  describe('handleDisconnect', () => {
    it('should remove user session on disconnect', () => {
      const client = makeSocket('user-1')

      gateway.handleDisconnect(client as never)

      // No error thrown means session was handled
    })
  })

  describe('handleStreamTrack', () => {
    const validTrackId = '01234567-89ab-7def-8123-456789abcdef'

    it('should stream the closest available quality as binary chunks', async () => {
      const stream = Readable.from([Buffer.from('audio')])
      streamingService.getTrackAudioStream.mockResolvedValue({
        stream,
        trackId: validTrackId,
        bitrate: 192,
        format: 'opus',
        codec: 'opus',
        contentType: 'audio/ogg',
        size: 2048,
      } as never)
      const client = makeSocket('user-1')

      const result = await gateway.handleStreamTrack(client as never, {
        trackId: validTrackId,
        bitrate: 256,
      })
      await new Promise((resolve) => setImmediate(resolve))

      expect(result.data).toEqual(
        expect.objectContaining({ success: true, bitrate: 192, format: 'opus' }),
      )
      expect(client.timeout).toHaveBeenCalledWith(10_000)
      expect(client.emitWithAck).toHaveBeenCalledWith(
        'audioChunk',
        expect.objectContaining({ sequence: 0, chunk: expect.any(Buffer) }),
      )
      expect(client.emit).toHaveBeenCalledWith(
        'audioStreamEnded',
        expect.objectContaining({ chunks: 1 }),
      )
    })
  })

  describe('handlePlayTrack', () => {
    const validTrackId = '01234567-89ab-7def-8123-456789abcdef'

    it('should return error when client has no userId', async () => {
      const client = makeSocket(undefined)
      const result = await gateway.handlePlayTrack(client as never, {
        trackId: validTrackId,
        currentTime: 0,
      })

      expect(result.data.success).toBe(false)
    })

    it('should return error when payload is invalid', async () => {
      const client = makeSocket('user-1')
      const result = await gateway.handlePlayTrack(client as never, {
        trackId: 'invalid-uuid',
        currentTime: -1,
      })

      expect(result.data.success).toBe(false)
    })

    it('should return error when track not found', async () => {
      tracksService.findTrackById.mockResolvedValue(null as never)
      const client = makeSocket('user-1')
      const result = await gateway.handlePlayTrack(client as never, {
        trackId: validTrackId,
        currentTime: 0,
      })

      expect(result.data.success).toBe(false)
    })

    it('should emit trackPlaying and return success on valid play', async () => {
      const track = buildTrack({ id: validTrackId })
      tracksService.findTrackById.mockResolvedValue(track as never)
      streamingService.getTrackAudioStream.mockResolvedValue({
        stream: Readable.from([]),
        trackId: validTrackId,
        bitrate: 192,
        format: 'opus',
        codec: 'opus',
        contentType: 'audio/ogg',
        size: 2048,
      } as never)
      const client = makeSocket('user-1')

      const result = await gateway.handlePlayTrack(client as never, {
        trackId: validTrackId,
        currentTime: 10,
      })

      expect(result.data.success).toBe(true)
      expect(gateway.server.to).toHaveBeenCalledWith('user_user-1')
    })
  })

  describe('handlePauseTrack', () => {
    const validTrackId = '01234567-89ab-7def-8123-456789abcdef'

    it('should return error when client has no userId', () => {
      const client = makeSocket(undefined)
      const result = gateway.handlePauseTrack(client as never, {
        trackId: validTrackId,
        currentTime: 0,
      })

      expect(result.data.success).toBe(false)
    })

    it('should emit trackPaused and stop streams on all user sockets', async () => {
      wsGuard.canActivate.mockResolvedValue(true as never)
      const firstClient = makeSocket('user-1', 'socket-1')
      const secondClient = makeSocket('user-1', 'socket-2')
      await gateway.handleConnection(firstClient as never)
      await gateway.handleConnection(secondClient as never)

      const firstStream = new PassThrough()
      const secondStream = new PassThrough()
      streamingService.getTrackAudioStream
        .mockResolvedValueOnce({
          stream: firstStream,
          trackId: validTrackId,
          bitrate: 192,
          format: 'opus',
          codec: 'opus',
          contentType: 'audio/ogg',
          size: 2048,
        } as never)
        .mockResolvedValueOnce({
          stream: secondStream,
          trackId: validTrackId,
          bitrate: 192,
          format: 'opus',
          codec: 'opus',
          contentType: 'audio/ogg',
          size: 2048,
        } as never)
      await gateway.handleStreamTrack(firstClient as never, { trackId: validTrackId })
      await gateway.handleStreamTrack(secondClient as never, { trackId: validTrackId })

      const result = gateway.handlePauseTrack(firstClient as never, {
        trackId: validTrackId,
        currentTime: 30,
      })

      expect(result.data.success).toBe(true)
      expect(firstStream.destroyed).toBe(true)
      expect(secondStream.destroyed).toBe(true)
      expect(gateway.server.to).toHaveBeenCalledWith('user_user-1')
    })
  })

  describe('handleGetCurrentState', () => {
    it('should return error when no userId', () => {
      const client = makeSocket(undefined)
      const result = gateway.handleGetCurrentState(client as never)

      expect(result.data).toEqual({ error: 'Unauthorized' })
    })

    it('should return isPlaying false when no active session', () => {
      const client = makeSocket('user-1')
      const result = gateway.handleGetCurrentState(client as never)

      expect(result.data).toEqual({ isPlaying: false })
    })
  })
})
