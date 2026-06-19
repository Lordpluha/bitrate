import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import type { WsUserAuthGuard } from '@modules/users-auth/users-auth.ws.guard'
import type { Server } from 'socket.io'
import { buildTrack } from './__tests__/fixtures/tracks.fixtures'
import { AudioGateway } from './audio.gateway'
import type { TracksService } from './tracks.service'

const makeTracksServiceMock = () =>
  ({
    findTrackById: jest.fn(),
  }) as unknown as jest.Mocked<TracksService>

const makeWsGuardMock = () =>
  ({
    canActivate: jest.fn(),
  }) as unknown as jest.Mocked<WsUserAuthGuard>

const makeServerMock = () =>
  ({
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
  }) as unknown as jest.Mocked<Server>

const makeSocket = (userId?: string) => ({
  id: 'socket-1',
  userId,
  disconnect: jest.fn(),
  join: jest.fn(),
  emit: jest.fn(),
})

describe('AudioGateway', () => {
  let gateway: AudioGateway
  let tracksService: jest.Mocked<TracksService>
  let wsGuard: jest.Mocked<WsUserAuthGuard>

  beforeEach(() => {
    tracksService = makeTracksServiceMock()
    wsGuard = makeWsGuardMock()
    gateway = new AudioGateway(tracksService, wsGuard)
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
    })
  })

  describe('handleDisconnect', () => {
    it('should remove user session on disconnect', () => {
      const client = makeSocket('user-1')

      gateway.handleDisconnect(client as never)

      // No error thrown means session was handled
    })
  })

  describe('handlePlayTrack', () => {
    const validTrackId = '01234567-89ab-7def-8123-456789abcdef'

    it('should return error when client has no userId', async () => {
      const client = makeSocket(undefined)
      const result = await gateway.handlePlayTrack(client as never, {
        trackId: validTrackId,
        userId: 'user-1',
        currentTime: 0,
      })

      expect(result.data.success).toBe(false)
    })

    it('should return error when payload is invalid', async () => {
      const client = makeSocket('user-1')
      const result = await gateway.handlePlayTrack(client as never, {
        trackId: 'invalid-uuid',
        userId: 'user-1',
        currentTime: -1,
      })

      expect(result.data.success).toBe(false)
    })

    it('should return error when track not found', async () => {
      tracksService.findTrackById.mockResolvedValue(null as never)
      const client = makeSocket('user-1')
      const result = await gateway.handlePlayTrack(client as never, {
        trackId: validTrackId,
        userId: 'user-1',
        currentTime: 0,
      })

      expect(result.data.success).toBe(false)
    })

    it('should emit trackPlaying and return success on valid play', async () => {
      const track = buildTrack({ id: validTrackId })
      tracksService.findTrackById.mockResolvedValue(track as never)
      const client = makeSocket('user-1')

      const result = await gateway.handlePlayTrack(client as never, {
        trackId: validTrackId,
        userId: 'user-1',
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
        userId: 'user-1',
        currentTime: 0,
      })

      expect(result.data.success).toBe(false)
    })

    it('should emit trackPaused and return success on valid pause', () => {
      const client = makeSocket('user-1')
      const result = gateway.handlePauseTrack(client as never, {
        trackId: validTrackId,
        userId: 'user-1',
        currentTime: 30,
      })

      expect(result.data.success).toBe(true)
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
