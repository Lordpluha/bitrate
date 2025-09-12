import { Test, TestingModule } from '@nestjs/testing'
import { Server } from 'socket.io'

import { TokenService } from '../auth/token.service'

import { AudioGateway } from './audio.gateway'
import { TracksService } from './tracks.service'

interface MockSocket {
  id: string
  userId?: string
  join: jest.Mock
  emit: jest.Mock
  disconnect: jest.Mock
  handshake: {
    auth: { token?: string }
    headers: Record<string, unknown>
    query?: Record<string, unknown>
  }
}

describe('AudioGateway', () => {
  let gateway: AudioGateway

  const createMockSocket = (token?: string): MockSocket => ({
    id: 'socket-id',
    userId: 'user-id',
    join: jest.fn().mockResolvedValue(undefined),
    emit: jest.fn(),
    disconnect: jest.fn(),
    handshake: {
      auth: { token },
      headers: {},
      query: {}
    }
  })

  const mockTokenService = {
    verifyToken: jest.fn()
  }

  const mockTracksService = {
    findTrackById: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AudioGateway,
        { provide: TokenService, useValue: mockTokenService },
        { provide: TracksService, useValue: mockTracksService }
      ]
    }).compile()

    gateway = module.get<AudioGateway>(AudioGateway)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('handleConnection', () => {
    it('should successfully connect authenticated user', async () => {
      const mockSocket = createMockSocket('valid-token')
      mockTokenService.verifyToken.mockResolvedValue({ sub: 'user-id' })

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      await gateway.handleConnection(mockSocket as unknown as any)

      expect(mockTokenService.verifyToken).toHaveBeenCalledWith('valid-token')
      expect(mockSocket.join).toHaveBeenCalledWith('user_user-id')
    })

    it('should disconnect user without token', async () => {
      const mockSocket = createMockSocket()

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      await gateway.handleConnection(mockSocket as unknown as any)

      expect(mockSocket.disconnect).toHaveBeenCalled()
    })
  })

  describe('handlePlayTrack', () => {
    it('should play track for authenticated user', async () => {
      const mockSocket = createMockSocket('valid-token')
      mockSocket.userId = 'user-id'

      gateway.server = {
        to: jest.fn().mockReturnValue({
          emit: jest.fn()
        })
      } as Partial<Server> as Server

      const payload = {
        trackId: 'track-id',
        userId: 'user-id',
        currentTime: 0
      }

      mockTracksService.findTrackById.mockResolvedValue({
        id: 'track-id',
        title: 'Test Track'
      })

      const result = await gateway.handlePlayTrack(
        mockSocket as unknown as any,
        payload
      )

      expect(result.data).toEqual(
        expect.objectContaining({
          success: true,
          trackId: 'track-id'
        })
      )
    })
  })

  describe('emitToUser', () => {
    it('should emit event to specific user room', () => {
      const mockEmit = jest.fn()
      const mockTo = jest.fn().mockReturnValue({ emit: mockEmit })
      gateway.server = {
        to: mockTo
      } as Partial<Server> as Server

      gateway.emitToUser('user-id', 'testEvent', { data: 'test' })

      expect(mockTo).toHaveBeenCalledWith('user_user-id')
      expect(mockEmit).toHaveBeenCalledWith('testEvent', { data: 'test' })
    })
  })
})
