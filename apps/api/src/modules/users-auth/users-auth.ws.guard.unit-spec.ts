import type { PrismaService } from '@infra/prisma/prisma.service'
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import type { ExecutionContext } from '@nestjs/common'
import { WsException } from '@nestjs/websockets'
import { type DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'
import type { Socket } from 'socket.io'
import type { TokenService } from '../tokens/token.service'
import { WS_SESSION_RECHECK_MS, type WsAuthClient, WsUserAuthGuard } from './users-auth.ws.guard'

const createWsContext = (client: Socket): ExecutionContext =>
  ({
    switchToWs: () => ({
      getClient: () => client,
    }),
  }) as ExecutionContext

const signedInClient = () =>
  ({
    handshake: { headers: { cookie: 'access_token=access-token' } },
    disconnect: jest.fn(),
  }) as unknown as WsAuthClient & { disconnect: jest.Mock }

describe('WsUserAuthGuard', () => {
  let guard: WsUserAuthGuard
  let tokenService: DeepMockProxy<TokenService>
  let prisma: DeepMockProxy<PrismaService>

  const sessionIsLive = () => {
    tokenService.verifyToken.mockResolvedValue({ sub: 'user-1', username: 'user', type: 'user' })
    tokenService.hashToken.mockReturnValue('hashed-token')
    prisma.userSession.findFirst.mockResolvedValue({ id: 'session-1' } as never)
  }

  beforeEach(() => {
    process.env.ACCESS_TOKEN_NAME = 'access_token'
    tokenService = mockDeep<TokenService>()
    prisma = mockDeep<PrismaService>()
    mockReset(tokenService)
    mockReset(prisma)

    guard = new WsUserAuthGuard(tokenService, prisma)
  })

  afterEach(() => {
    jest.useRealTimers()
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
    sessionIsLive()
    const client = signedInClient()

    const result = await guard.canActivate(createWsContext(client))

    expect(result).toBe(true)
    expect(client.userId).toBe('user-1')
    expect(client.username).toBe('user')
  })

  /** One query matches the session by hash and requires its account to be active: a revoked
   * session and a soft-deleted user are both rejected without a second lookup. */
  it('should look the session up with its active account in one query', async () => {
    sessionIsLive()

    await guard.canActivate(createWsContext(signedInClient()))

    expect(prisma.userSession.findFirst).toHaveBeenCalledTimes(1)
    expect(prisma.userSession.findFirst).toHaveBeenCalledWith({
      where: { userId: 'user-1', access_token: 'hashed-token', user: { deletedAt: null } },
      select: { id: true },
    })
    expect(prisma.user.findFirst).not.toHaveBeenCalled()
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

  it('should reject when the session is revoked or the user soft-deleted', async () => {
    tokenService.verifyToken.mockResolvedValue({ sub: 'user-1', username: 'user', type: 'user' })
    tokenService.hashToken.mockReturnValue('hashed-token')
    prisma.userSession.findFirst.mockResolvedValue(null)
    const client = signedInClient()

    await expect(guard.canActivate(createWsContext(client))).rejects.toThrow('Unauthorized')
    // Never signed in: the gateway's connect handler owns disconnecting it.
    expect(client.disconnect).not.toHaveBeenCalled()
  })

  describe('on an already authenticated socket', () => {
    it('trusts the confirmed session for messages within the re-check window', async () => {
      jest.useFakeTimers({ now: new Date('2026-10-21T12:00:00.000Z') })
      sessionIsLive()
      const client = signedInClient()
      await guard.canActivate(createWsContext(client))

      jest.advanceTimersByTime(WS_SESSION_RECHECK_MS - 1)
      await expect(guard.canActivate(createWsContext(client))).resolves.toBe(true)

      expect(tokenService.verifyToken).toHaveBeenCalledTimes(1)
      expect(prisma.userSession.findFirst).toHaveBeenCalledTimes(1)
    })

    it('checks the session again once the window has passed', async () => {
      jest.useFakeTimers({ now: new Date('2026-10-21T12:00:00.000Z') })
      sessionIsLive()
      const client = signedInClient()
      await guard.canActivate(createWsContext(client))

      jest.advanceTimersByTime(WS_SESSION_RECHECK_MS)
      await expect(guard.canActivate(createWsContext(client))).resolves.toBe(true)

      expect(tokenService.verifyToken).toHaveBeenCalledTimes(2)
      expect(prisma.userSession.findFirst).toHaveBeenCalledTimes(2)
      expect(client.disconnect).not.toHaveBeenCalled()
    })

    it('rejects and disconnects once its session has been revoked', async () => {
      jest.useFakeTimers({ now: new Date('2026-10-21T12:00:00.000Z') })
      sessionIsLive()
      const client = signedInClient()
      await guard.canActivate(createWsContext(client))

      prisma.userSession.findFirst.mockResolvedValue(null)
      jest.advanceTimersByTime(WS_SESSION_RECHECK_MS)

      await expect(guard.canActivate(createWsContext(client))).rejects.toThrow('Unauthorized')
      expect(client.disconnect).toHaveBeenCalledTimes(1)
      // The next message must check again rather than reuse the old confirmation.
      await expect(guard.canActivate(createWsContext(client))).rejects.toThrow('Unauthorized')
    })

    it('rejects and disconnects once its access token no longer verifies', async () => {
      jest.useFakeTimers({ now: new Date('2026-10-21T12:00:00.000Z') })
      sessionIsLive()
      const client = signedInClient()
      await guard.canActivate(createWsContext(client))

      tokenService.verifyToken.mockRejectedValue(new Error('jwt expired'))
      jest.advanceTimersByTime(WS_SESSION_RECHECK_MS)

      await expect(guard.canActivate(createWsContext(client))).rejects.toThrow('Unauthorized')
      expect(client.disconnect).toHaveBeenCalledTimes(1)
    })
  })
})
