import type { PrismaService } from '@infra/prisma/prisma.service'
import { beforeEach, describe, expect, it } from '@jest/globals'
import type { ExecutionContext } from '@nestjs/common'
import { WsException } from '@nestjs/websockets'
import { type DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'
import type { Socket } from 'socket.io'
import type { TokenService } from '../tokens/token.service'
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
  let prisma: DeepMockProxy<PrismaService>

  beforeEach(() => {
    process.env.ACCESS_TOKEN_NAME = 'access_token'
    tokenService = mockDeep<TokenService>()
    prisma = mockDeep<PrismaService>()
    mockReset(tokenService)
    mockReset(prisma)

    guard = new WsUserAuthGuard(tokenService, prisma)
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
    tokenService.verifyToken.mockResolvedValue({ sub: 'user-1', username: 'user', type: 'user' })
    tokenService.hashToken.mockReturnValue('hashed-token')
    prisma.userSession.findFirst.mockResolvedValue({
      id: 'session-1',
      userId: 'user-1',
      access_token: 'hashed-token',
      refresh_token: 'hashed-refresh',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    })
    prisma.user.findFirst.mockResolvedValue({ id: 'user-1' } as never)

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

  /** A soft-deleted user is rejected at connect even with a live session row — the take-down
   * revokes stored sessions, but this guards the narrow window where a stale/replayed session
   * still matches by hash. Already-open sockets are unaffected until they disconnect; that is
   * a documented limitation, not a bug this guard is meant to close. */
  it('should reject when the user is soft-deleted', async () => {
    tokenService.verifyToken.mockResolvedValue({ sub: 'user-1', username: 'user', type: 'user' })
    tokenService.hashToken.mockReturnValue('hashed-token')
    prisma.userSession.findFirst.mockResolvedValue({
      id: 'session-1',
      userId: 'user-1',
      access_token: 'hashed-token',
      refresh_token: 'hashed-refresh',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    })
    prisma.user.findFirst.mockResolvedValue(null)

    const client = {
      handshake: {
        headers: {
          cookie: 'access_token=access-token',
        },
      },
    } as Socket

    await expect(guard.canActivate(createWsContext(client))).rejects.toThrow('Unauthorized')
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { id: 'user-1', deletedAt: null },
      select: { id: true },
    })
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

  it('should reject when session not found', async () => {
    tokenService.verifyToken.mockResolvedValue({ sub: 'user-1', username: 'user', type: 'user' })
    tokenService.hashToken.mockReturnValue('hashed-token')
    prisma.userSession.findFirst.mockResolvedValue(null)

    const client = {
      handshake: {
        headers: {
          cookie: 'access_token=access-token',
        },
      },
    } as Socket

    await expect(guard.canActivate(createWsContext(client))).rejects.toThrow('Unauthorized')
  })
})
