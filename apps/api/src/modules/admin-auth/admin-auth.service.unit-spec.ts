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
})
