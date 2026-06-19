import { beforeEach, describe, expect, it } from '@jest/globals'
import { ExecutionContext } from '@nestjs/common'
import { WsException } from '@nestjs/websockets'
import { type DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'
import { Socket } from 'socket.io'
import { TokenService } from '../tokens/token.service'
import { WsUserAuthGuard } from './users-auth.ws.guard'

const createWsContext = (client: Socket): ExecutionContext =>
  ({
    switchToWs: () => ({
      getClient: () => client,
    }),
  }) as ExecutionContext

describe('WsUserAuthGuard', () => {
  let guard: WsUserAuthGuard
  let tokenService: DeepMockProxy<TokenService>

  beforeEach(() => {
    process.env.ACCESS_TOKEN_NAME = 'access_token'
    tokenService = mockDeep<TokenService>()
    mockReset(tokenService)

    guard = new WsUserAuthGuard(tokenService)
  })

  it('should reject when token missing', async () => {
    const client = {
      handshake: {
        headers: {},
      },
    } as Socket

    try {
      await guard.canActivate(createWsContext(client))
      throw new Error('Expected guard to throw')
    } catch (error) {
      expect(error).toBeInstanceOf(WsException)
      expect((error as WsException).message).toBe('Unauthorized')
    }
  })

  it('should allow when token valid', async () => {
    tokenService.verifyToken.mockResolvedValue({ sub: 'user-1', username: 'user' })

    const client = {
      handshake: {
        headers: {
          cookie: 'access_token=access-token',
        },
      },
    } as Socket & { userId?: string; username?: string }

    const result = await guard.canActivate(createWsContext(client))

    expect(result).toBe(true)
    expect(client.userId).toBe('user-1')
    expect(client.username).toBe('user')
  })

  it('should reject when token invalid', async () => {
    tokenService.verifyToken.mockRejectedValue(new Error('bad token'))

    const client = {
      handshake: {
        headers: {
          cookie: 'access_token=bad-token',
        },
      },
    } as Socket

    await expect(guard.canActivate(createWsContext(client))).rejects.toThrow('Unauthorized')
  })
})
