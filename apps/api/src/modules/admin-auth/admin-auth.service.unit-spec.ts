import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { HttpException, UnauthorizedException } from '@nestjs/common'
import type { JwtService } from '@nestjs/jwt'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import type { TokenService } from '../tokens/token.service'
import { buildStaff } from './__tests__/fixtures/admin-auth.fixtures'
import { AdminAuthService } from './admin-auth.service'

const makeTokenServiceMock = () => {
  const mock = {
    verifyPassword: jest.fn(),
    hashToken: jest.fn(),
    generateAccessToken: jest.fn(),
    generateRefreshToken: jest.fn(),
    getRefreshTokenExpiresAt: jest.fn(),
  } as unknown as jest.Mocked<TokenService>
  mock.hashToken.mockReturnValue('hashed')
  mock.generateAccessToken.mockResolvedValue('access')
  mock.generateRefreshToken.mockResolvedValue('refresh')
  mock.getRefreshTokenExpiresAt.mockReturnValue(new Date())
  return mock
}

const makeJwtServiceMock = () =>
  ({
    verifyAsync: jest.fn(),
  }) as unknown as jest.Mocked<JwtService>

/** The lockout window the service applies once the attempt threshold is reached. */
const LOCK_DURATION_MS = 15 * 60 * 1000

/** The attempt count at which an account is locked. */
const MAX_LOGIN_ATTEMPTS = 5

/** The row shape `recordFailedLogin` reads back after incrementing the counter. */
type AttemptResult = {
  failedLoginAttempts: number
  lockedUntil: Date | null
}

describe('AdminAuthService', () => {
  let service: AdminAuthService
  let prisma: PrismaMock
  let token: jest.Mocked<TokenService>
  let jwt: jest.Mocked<JwtService>

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    token = makeTokenServiceMock()
    jwt = makeJwtServiceMock()
    service = new AdminAuthService(jwt, prisma, token)
  })

  /** Stands in for the atomic increment, which returns the row's new counter value. */
  const mockAttemptResult = (result: AttemptResult | null) => {
    prisma.staff.updateManyAndReturn.mockResolvedValue((result ? [result] : []) as never)
  }

  /** The deadline the service wrote, for an instant-level assertion. */
  const writtenLockedUntil = (): Date | null => {
    const call = prisma.staff.updateMany.mock.calls.at(-1)?.[0]
    const data = call?.data as { lockedUntil?: Date | null } | undefined
    return data?.lockedUntil ?? null
  }

  describe('loginStaff', () => {
    it('rejects an unknown email with UnauthorizedException', async () => {
      prisma.staff.findFirst.mockResolvedValue(null)
      token.verifyPassword.mockResolvedValue(false as never)

      await expect(service.loginStaff('nobody@bitrate.app', 'password')).rejects.toThrow(
        UnauthorizedException,
      )
    })

    it('rejects a wrong password with UnauthorizedException', async () => {
      const staff = buildStaff()
      prisma.staff.findFirst.mockResolvedValue(staff as never)
      token.verifyPassword.mockResolvedValue(false as never)
      mockAttemptResult({ failedLoginAttempts: 1, lockedUntil: null })

      await expect(service.loginStaff(staff.email, 'wrong')).rejects.toThrow(UnauthorizedException)
    })

    it('rejects a locked account with HttpException (429)', async () => {
      const staff = buildStaff({ lockedUntil: new Date(Date.now() + 60_000) })
      prisma.staff.findFirst.mockResolvedValue(staff as never)

      await expect(service.loginStaff(staff.email, 'password')).rejects.toThrow(HttpException)
    })

    it('issues a token pair and creates a session on success', async () => {
      const staff = buildStaff()
      prisma.staff.findFirst.mockResolvedValue(staff as never)
      token.verifyPassword.mockResolvedValue(true as never)

      const result = await service.loginStaff(staff.email, 'password')

      expect(result).toEqual({ access_token: 'access', refresh_token: 'refresh' })
      expect(prisma.staffSession.create).toHaveBeenCalledTimes(1)
    })
  })

  describe('refresh', () => {
    it('rejects an invalid refresh token', async () => {
      jwt.verifyAsync.mockRejectedValue(new Error('bad token') as never)

      await expect(service.refresh('bad')).rejects.toThrow(UnauthorizedException)
    })

    it('rejects when the staff account no longer exists', async () => {
      jwt.verifyAsync.mockResolvedValue({ sub: 'staff-1', username: 'ops', type: 'staff' } as never)
      prisma.staff.findFirst.mockResolvedValue(null)

      await expect(service.refresh('rt')).rejects.toThrow(UnauthorizedException)
    })
  })

  describe('logout', () => {
    it('rejects when the staff account no longer exists', async () => {
      prisma.staff.findFirst.mockResolvedValue(null)

      await expect(service.logout('staff-1', 'at')).rejects.toThrow(UnauthorizedException)
    })
  })
  describe('failed login lockout', () => {
    const failLogin = async (staff: ReturnType<typeof buildStaff>) => {
      prisma.staff.findFirst.mockResolvedValue(staff as never)
      token.verifyPassword.mockResolvedValue(false as never)
      await expect(service.loginStaff(staff.email, 'wrong')).rejects.toThrow(UnauthorizedException)
    }

    it('increments the attempt counter on every failure', async () => {
      const staff = buildStaff()
      mockAttemptResult({ failedLoginAttempts: 1, lockedUntil: null })

      await failLogin(staff)

      expect(prisma.staff.updateManyAndReturn).toHaveBeenCalledWith({
        where: { id: staff.id },
        data: { failedLoginAttempts: { increment: 1 } },
        select: { failedLoginAttempts: true, lockedUntil: true },
      })
    })

    it('does not lock the account below the threshold', async () => {
      const staff = buildStaff()
      mockAttemptResult({ failedLoginAttempts: MAX_LOGIN_ATTEMPTS - 1, lockedUntil: null })

      await failLogin(staff)

      expect(prisma.staff.updateMany).not.toHaveBeenCalled()
    })

    it('clears a stale lock while the count is below the threshold', async () => {
      const staff = buildStaff()
      mockAttemptResult({ failedLoginAttempts: 1, lockedUntil: new Date() })

      await failLogin(staff)

      expect(prisma.staff.updateMany).toHaveBeenCalledWith({
        where: { id: staff.id },
        data: { lockedUntil: null },
      })
    })

    it('locks the account for the lock duration once the threshold is reached', async () => {
      const staff = buildStaff()
      mockAttemptResult({ failedLoginAttempts: MAX_LOGIN_ATTEMPTS, lockedUntil: null })
      const before = Date.now()

      await failLogin(staff)

      const lockedUntil = writtenLockedUntil()
      expect(lockedUntil).toBeInstanceOf(Date)
      /**
       * The deadline is a real instant, not a wall-clock value that a timezone-dropping
       * cast would have shifted. `loginStaff` compares it against `new Date()`.
       */
      expect((lockedUntil as Date).getTime()).toBeGreaterThanOrEqual(before + LOCK_DURATION_MS)
      expect((lockedUntil as Date).getTime()).toBeLessThanOrEqual(Date.now() + LOCK_DURATION_MS)
    })

    it('is a no-op when the account disappeared mid-request', async () => {
      const staff = buildStaff()
      mockAttemptResult(null)

      await failLogin(staff)

      expect(prisma.staff.updateMany).not.toHaveBeenCalled()
    })
  })
})
