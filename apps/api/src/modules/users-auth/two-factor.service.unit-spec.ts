import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { BadRequestException, UnauthorizedException } from '@nestjs/common'
import type { ConfigService } from '@nestjs/config'
import type { JwtService } from '@nestjs/jwt'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { type DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'
import { buildUser } from '../users/__tests__/fixtures/users.fixtures'
import { TwoFactorService } from './two-factor.service'

jest.mock('otplib', () => ({
  generateSecret: jest.fn(() => 'MOCK_SECRET'),
  generateURI: jest.fn(
    () => 'otpauth://totp/Bitrate:user@example.com?secret=MOCK_SECRET&issuer=Bitrate',
  ),
  verify: jest.fn(),
}))

jest.mock('qrcode', () => ({
  toDataURL: jest.fn(async () => 'data:image/png;base64,mock'),
}))

import { verify } from 'otplib'

describe('TwoFactorService', () => {
  let service: TwoFactorService
  let prisma: PrismaMock
  let jwt: DeepMockProxy<JwtService>
  let config: DeepMockProxy<ConfigService>

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock

    jwt = mockDeep<JwtService>()
    config = mockDeep<ConfigService>()

    mockReset(jwt)
    mockReset(config)

    config.getOrThrow.mockReturnValue('test-secret' as never)

    service = new TwoFactorService(prisma, jwt, config)
  })

  describe('setupTwoFactor', () => {
    it('should throw when 2FA already enabled', async () => {
      const user = buildUser({ twoFactorEnabled: true, twoFactorSecret: 'existing-secret' })
      prisma.user.findUniqueOrThrow.mockResolvedValue(user as never)

      await expect(service.setupTwoFactor(user.id)).rejects.toThrow(BadRequestException)
    })

    it('should generate QR code and manual code when 2FA not enabled', async () => {
      const user = buildUser({ twoFactorEnabled: false, twoFactorSecret: null })
      prisma.user.findUniqueOrThrow.mockResolvedValue(user as never)
      prisma.user.update.mockResolvedValue(user as never)

      const result = await service.setupTwoFactor(user.id)

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: { twoFactorSecret: 'MOCK_SECRET', twoFactorEnabled: false },
      })
      expect(result).toEqual({
        qrCodeDataUrl: 'data:image/png;base64,mock',
        manualCode: 'MOCK_SECRET',
      })
    })
  })

  describe('enableTwoFactor', () => {
    it('should throw when setup not started (no secret)', async () => {
      const user = buildUser({ twoFactorEnabled: false, twoFactorSecret: null })
      prisma.user.findUniqueOrThrow.mockResolvedValue(user as never)

      await expect(service.enableTwoFactor(user.id, '123456')).rejects.toThrow(BadRequestException)
    })

    it('should throw when code is invalid', async () => {
      const user = buildUser({ twoFactorEnabled: false, twoFactorSecret: 'SECRET' })
      prisma.user.findUniqueOrThrow.mockResolvedValue(user as never)
      ;(verify as jest.Mock).mockResolvedValue({ valid: false } as never)

      await expect(service.enableTwoFactor(user.id, '000000')).rejects.toThrow(
        UnauthorizedException,
      )
    })

    it('should enable 2FA when code is valid', async () => {
      const user = buildUser({ twoFactorEnabled: false, twoFactorSecret: 'SECRET' })
      prisma.user.findUniqueOrThrow.mockResolvedValue(user as never)
      ;(verify as jest.Mock).mockResolvedValue({ valid: true } as never)
      prisma.user.update.mockResolvedValue(user as never)

      await service.enableTwoFactor(user.id, '123456')

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: { twoFactorEnabled: true },
      })
    })
  })

  describe('disableTwoFactor', () => {
    it('should throw when 2FA is not enabled', async () => {
      const user = buildUser({ twoFactorEnabled: false, twoFactorSecret: null })
      prisma.user.findUniqueOrThrow.mockResolvedValue(user as never)

      await expect(service.disableTwoFactor(user.id, '123456')).rejects.toThrow(BadRequestException)
    })

    it('should throw when code is invalid', async () => {
      const user = buildUser({ twoFactorEnabled: true, twoFactorSecret: 'SECRET' })
      prisma.user.findUniqueOrThrow.mockResolvedValue(user as never)
      ;(verify as jest.Mock).mockResolvedValue({ valid: false } as never)

      await expect(service.disableTwoFactor(user.id, '000000')).rejects.toThrow(
        UnauthorizedException,
      )
    })

    it('should disable 2FA and clear secret when code valid', async () => {
      const user = buildUser({ twoFactorEnabled: true, twoFactorSecret: 'SECRET' })
      prisma.user.findUniqueOrThrow.mockResolvedValue(user as never)
      ;(verify as jest.Mock).mockResolvedValue({ valid: true } as never)
      prisma.user.update.mockResolvedValue(user as never)

      await service.disableTwoFactor(user.id, '123456')

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: { twoFactorEnabled: false, twoFactorSecret: null },
      })
    })
  })

  describe('verifyLoginCode', () => {
    it('should throw when pending token is invalid', async () => {
      jwt.verifyAsync.mockRejectedValue(new Error('bad token') as never)

      await expect(service.verifyLoginCode('bad-token', '123456')).rejects.toThrow(
        UnauthorizedException,
      )
    })

    it('should throw when token type is not twofa', async () => {
      jwt.verifyAsync.mockResolvedValue({ sub: 'user-1', twofa: false } as never)

      await expect(service.verifyLoginCode('token', '123456')).rejects.toThrow(
        UnauthorizedException,
      )
    })

    it('should throw when 2FA not enabled on user', async () => {
      const user = buildUser({ twoFactorEnabled: false, twoFactorSecret: null })
      jwt.verifyAsync.mockResolvedValue({ sub: user.id, twofa: true } as never)
      prisma.user.findUniqueOrThrow.mockResolvedValue(user as never)

      await expect(service.verifyLoginCode('token', '123456')).rejects.toThrow(BadRequestException)
    })

    it('should throw when TOTP code is invalid', async () => {
      const user = buildUser({ twoFactorEnabled: true, twoFactorSecret: 'SECRET' })
      jwt.verifyAsync.mockResolvedValue({ sub: user.id, twofa: true } as never)
      prisma.user.findUniqueOrThrow.mockResolvedValue(user as never)
      ;(verify as jest.Mock).mockResolvedValue({ valid: false } as never)

      await expect(service.verifyLoginCode('token', '000000')).rejects.toThrow(
        UnauthorizedException,
      )
    })

    it('should return user when token and code are valid', async () => {
      const user = buildUser({ twoFactorEnabled: true, twoFactorSecret: 'SECRET' })
      jwt.verifyAsync.mockResolvedValue({ sub: user.id, twofa: true } as never)
      prisma.user.findUniqueOrThrow.mockResolvedValue(user as never)
      ;(verify as jest.Mock).mockResolvedValue({ valid: true } as never)

      const result = await service.verifyLoginCode('valid-token', '123456')

      expect(result).toBe(user)
    })
  })
})
