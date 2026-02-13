import { beforeEach, describe, expect, it } from '@jest/globals'
import { ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { Request } from 'express'
import { type DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'
import { TokenService } from '../tokens/token.service'
import { buildUser } from '../users/__tests__/fixtures/users.fixtures'
import { buildUserSession } from './__tests__/fixtures/users-auth.fixtures'
import { UNAUTHORIZED_ERRORS } from './errors/unauthorized.errors'
import { UserAuthGuard } from './users-auth.guard'

const createHttpContext = (request: Request): ExecutionContext => {
  const handler = () => undefined
  class TestClass {}

  const context = mockDeep<ExecutionContext>()

  context.getHandler.mockReturnValue(handler)
  context.getClass.mockReturnValue(TestClass)
  context.switchToHttp.mockReturnValue({
    getRequest: <T = Request>() => request as T,
    getResponse: <T = unknown>() => undefined as T,
    getNext: <T = unknown>() => undefined as T,
  })

  return context
}

describe('UserAuthGuard', () => {
  let guard: UserAuthGuard
  let prisma: PrismaMock
  let reflector: DeepMockProxy<Reflector>
  let tokenService: DeepMockProxy<TokenService>

  beforeEach(() => {
    process.env.ACCESS_TOKEN_NAME = 'access_token'
    process.env.REFRESH_TOKEN_NAME = 'refresh_token'

    resetPrismaMock()
    prisma = prismaMock
    reflector = mockDeep<Reflector>()
    tokenService = mockDeep<TokenService>()

    mockReset(reflector)
    mockReset(tokenService)

    guard = new UserAuthGuard(prisma, reflector, tokenService)
  })

  it('should reject when access token missing', async () => {
    reflector.getAllAndOverride.mockReturnValue('access')

    const req = mockDeep<Request>()
    req.cookies = {}

    await expect(guard.canActivate(createHttpContext(req))).rejects.toThrow(
      UNAUTHORIZED_ERRORS.ACCESS_TOKEN_REQUIRED,
    )
  })

  it('should reject when refresh token missing', async () => {
    reflector.getAllAndOverride.mockReturnValue('refresh')

    const req = mockDeep<Request>()
    req.cookies = {}

    await expect(guard.canActivate(createHttpContext(req))).rejects.toThrow(
      UNAUTHORIZED_ERRORS.REFRESH_TOKEN_REQUIRED,
    )
  })

  it('should reject when token requirement invalid', async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined)

    const req = mockDeep<Request>()
    req.cookies = {}

    await expect(guard.canActivate(createHttpContext(req))).rejects.toThrow(
      UNAUTHORIZED_ERRORS.INVALID_TOKEN_REQUIREMENT,
    )
  })

  it('should set user and tokens on request', async () => {
    reflector.getAllAndOverride.mockReturnValue('access')

    const req = mockDeep<
      Request & { user?: ReturnType<typeof buildUser> } & Record<string, string>
    >()
    req.cookies = {
      access_token: 'access-token',
      refresh_token: 'refresh-token',
    }

    tokenService.verifyToken.mockResolvedValue({ sub: 'user-1', username: 'user' })
    prisma.user.findUnique.mockResolvedValue(buildUser({ id: 'user-1' }))
    prisma.userSession.findFirst.mockResolvedValue(
      buildUserSession({
        userId: 'user-1',
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      }),
    )

    const result = await guard.canActivate(createHttpContext(req))

    expect(result).toBe(true)
    expect(tokenService.verifyToken).toHaveBeenCalledTimes(2)
    expect(req.user).toBeDefined()
    expect(req.access_token).toBe('access-token')
    expect(req.refresh_token).toBe('refresh-token')
  })

  it('should reject when user not found', async () => {
    reflector.getAllAndOverride.mockReturnValue('access')

    const req = mockDeep<Request>()
    req.cookies = {
      access_token: 'access-token',
    }

    tokenService.verifyToken.mockResolvedValue({ sub: 'user-1', username: 'user' })
    prisma.user.findUnique.mockResolvedValue(null)

    await expect(guard.canActivate(createHttpContext(req))).rejects.toThrow(
      UNAUTHORIZED_ERRORS.INVALID_OR_EXPIRED_TOKEN,
    )
  })

  it('should reject when token verification fails', async () => {
    reflector.getAllAndOverride.mockReturnValue('access')

    const req = mockDeep<Request>()
    req.cookies = {
      access_token: 'access-token',
    }

    tokenService.verifyToken.mockRejectedValue(new Error('bad token'))

    await expect(guard.canActivate(createHttpContext(req))).rejects.toThrow(
      UNAUTHORIZED_ERRORS.INVALID_OR_EXPIRED_TOKEN,
    )
  })
})
