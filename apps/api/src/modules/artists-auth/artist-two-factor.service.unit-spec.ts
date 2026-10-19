import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { UnauthorizedException } from '@nestjs/common'
import type { ConfigService } from '@nestjs/config'
import type { JwtService } from '@nestjs/jwt'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { type DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { buildArtist } from '../artists/__tests__/fixtures/artists.fixtures'
import { ArtistTwoFactorService } from './artist-two-factor.service'

jest.mock('otplib', () => ({
  generateSecret: jest.fn(() => 'MOCK_SECRET'),
  generateURI: jest.fn(() => 'otpauth://totp/Bitrate:artist@example.com?secret=MOCK_SECRET'),
  verify: jest.fn(),
}))

jest.mock('qrcode', () => ({
  toDataURL: jest.fn(async () => 'data:image/png;base64,mock'),
}))

import { verify } from 'otplib'

describe('ArtistTwoFactorService', () => {
  let service: ArtistTwoFactorService
  let prisma: PrismaMock
  let jwt: DeepMockProxy<JwtService>

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    jwt = mockDeep<JwtService>()
    const config = {
      getOrThrow: jest.fn(() => 'test-secret'),
    } as unknown as ConfigService
    service = new ArtistTwoFactorService(prisma, jwt, config)
  })

  it('writes enrolment to the artist table', async () => {
    const artist = buildArtist({ id: 'artist-1' })
    prisma.artist.findUniqueOrThrow.mockResolvedValue({
      ...artist,
      twoFactorEnabled: false,
      twoFactorSecret: 'SECRET',
    } as never)
    jest.mocked(verify).mockResolvedValue({ valid: true } as never)

    await service.enableTwoFactor('artist-1', '123456')

    expect(prisma.artist.update).toHaveBeenCalledWith({
      where: { id: 'artist-1' },
      data: { twoFactorEnabled: true },
    })
  })

  it('refuses a pending login for a soft-deleted artist', async () => {
    jwt.verifyAsync.mockResolvedValue({ sub: 'artist-1', twofa: true } as never)
    prisma.artist.findFirst.mockResolvedValue(null)

    await expect(service.verifyLoginCode('pending', '123456')).rejects.toThrow(
      new UnauthorizedException('Artist account is unavailable'),
    )
    expect(prisma.artist.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'artist-1', deletedAt: null } }),
    )
  })

  it('returns the artist when the code is valid', async () => {
    jwt.verifyAsync.mockResolvedValue({ sub: 'artist-1', twofa: true } as never)
    const state = {
      id: 'artist-1',
      email: 'artist@example.com',
      twoFactorEnabled: true,
      twoFactorSecret: 'SECRET',
    }
    prisma.artist.findFirst.mockResolvedValue(state as never)
    jest.mocked(verify).mockResolvedValue({ valid: true } as never)

    await expect(service.verifyLoginCode('pending', '123456')).resolves.toEqual(state)
  })
})
