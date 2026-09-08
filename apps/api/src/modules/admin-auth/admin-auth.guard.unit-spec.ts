import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import type { TokenService } from '@modules/tokens/token.service'
import { ForbiddenException, UnauthorizedException } from '@nestjs/common'
import type { Reflector } from '@nestjs/core'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { buildStaff, buildStaffSession } from './__tests__/fixtures/admin-auth.fixtures'
import { AdminAuthGuard } from './admin-auth.guard'
import { UNAUTHORIZED_ERRORS } from './errors'

const makeTokenServiceMock = () =>
  ({
    verifyToken: jest.fn(),
    hashToken: jest.fn().mockReturnValue('hashed-token'),
    getTokenName: jest.fn((type: string) => (type === 'access' ? 'access_token' : 'refresh_token')),
  }) as unknown as jest.Mocked<TokenService>

const makeReflectorMock = (requirement: string, roles: string[] = []) =>
  ({
    getAllAndOverride: jest.fn((key: string) => (key === 'tokenRequirement' ? requirement : roles)),
  }) as unknown as Reflector

const makeContext = (cookies: Record<string, string>) => ({
  getHandler: () => ({}),
  getClass: () => ({}),
  switchToHttp: () => ({ getRequest: () => ({ cookies }) }),
})

describe('AdminAuthGuard', () => {
  let guard: AdminAuthGuard
  let prisma: PrismaMock
  let tokenService: jest.Mocked<TokenService>

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    tokenService = makeTokenServiceMock()
    process.env.ACCESS_TOKEN_NAME = 'access_token'
    process.env.REFRESH_TOKEN_NAME = 'refresh_token'
  })

  it('should throw ACCESS_TOKEN_REQUIRED when access token is missing', async () => {
    guard = new AdminAuthGuard(prisma, makeReflectorMock('access'), tokenService)

    await expect(guard.canActivate(makeContext({}) as never)).rejects.toThrow(
      UNAUTHORIZED_ERRORS.ACCESS_TOKEN_REQUIRED,
    )
  })

  it('should reject a user-type token (STAFF_NOT_FOUND)', async () => {
    guard = new AdminAuthGuard(prisma, makeReflectorMock('access'), tokenService)
    tokenService.verifyToken.mockResolvedValue({
      sub: 'user-1',
      username: 'user',
      type: 'user',
    } as never)

    await expect(guard.canActivate(makeContext({ access_token: 'at' }) as never)).rejects.toThrow(
      UNAUTHORIZED_ERRORS.STAFF_NOT_FOUND,
    )
  })

  it('should throw STAFF_NOT_FOUND when the staff record cannot be found', async () => {
    guard = new AdminAuthGuard(prisma, makeReflectorMock('access'), tokenService)
    tokenService.verifyToken.mockResolvedValue({
      sub: 'staff-1',
      username: 'ops',
      type: 'staff',
    } as never)
    prisma.staff.findFirst.mockResolvedValue(null)

    await expect(guard.canActivate(makeContext({ access_token: 'at' }) as never)).rejects.toThrow(
      UNAUTHORIZED_ERRORS.STAFF_NOT_FOUND,
    )
  })

  it('should throw SESSION_NOT_FOUND when no matching session exists', async () => {
    guard = new AdminAuthGuard(prisma, makeReflectorMock('access'), tokenService)
    tokenService.verifyToken.mockResolvedValue({
      sub: 'staff-1',
      username: 'ops',
      type: 'staff',
    } as never)
    prisma.staff.findFirst.mockResolvedValue(buildStaff() as never)
    prisma.staffSession.findFirst.mockResolvedValue(null)

    await expect(guard.canActivate(makeContext({ access_token: 'at' }) as never)).rejects.toThrow(
      UNAUTHORIZED_ERRORS.SESSION_NOT_FOUND,
    )
  })

  it('should throw ForbiddenException when the role is insufficient', async () => {
    guard = new AdminAuthGuard(prisma, makeReflectorMock('access', ['ADMIN']), tokenService)
    tokenService.verifyToken.mockResolvedValue({
      sub: 'staff-1',
      username: 'ops',
      type: 'staff',
    } as never)
    prisma.staff.findFirst.mockResolvedValue(buildStaff({ role: 'MODERATOR' }) as never)
    prisma.staffSession.findFirst.mockResolvedValue(buildStaffSession() as never)

    await expect(guard.canActivate(makeContext({ access_token: 'at' }) as never)).rejects.toThrow(
      ForbiddenException,
    )
  })

  it('should return true and attach staff to request when auth succeeds', async () => {
    guard = new AdminAuthGuard(
      prisma,
      makeReflectorMock('access', ['ADMIN', 'MODERATOR']),
      tokenService,
    )
    const staff = buildStaff({ role: 'MODERATOR' })
    const session = buildStaffSession()
    tokenService.verifyToken.mockResolvedValue({
      sub: 'staff-1',
      username: 'ops',
      type: 'staff',
    } as never)
    prisma.staff.findFirst.mockResolvedValue(staff as never)
    prisma.staffSession.findFirst.mockResolvedValue(session as never)

    const req: Record<string, unknown> = { cookies: { access_token: 'at' } }
    const ctx = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => req }),
    }

    const result = await guard.canActivate(ctx as never)

    expect(result).toBe(true)
    expect(req.staff).toBe(staff)
  })

  it('should throw UnauthorizedException when token verification fails', async () => {
    guard = new AdminAuthGuard(prisma, makeReflectorMock('access'), tokenService)
    tokenService.verifyToken.mockRejectedValue(new Error('invalid') as never)

    await expect(guard.canActivate(makeContext({ access_token: 'bad' }) as never)).rejects.toThrow(
      UnauthorizedException,
    )
  })
})
