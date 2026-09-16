import type { MailService } from '@infra/mail/mail.service'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { buildArtist } from '@modules/artists/__tests__/fixtures/artists.fixtures'
import type { ArtistsPrivateService } from '@modules/artists/artists.private.service'
import type { ArtistsService } from '@modules/artists/artists.service'
import type { TokenService } from '@modules/tokens/token.service'
import { ConflictException, UnauthorizedException } from '@nestjs/common'
import type { JwtService } from '@nestjs/jwt'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { buildArtistSession } from './__tests__/fixtures/artists-auth.fixtures'
import { ArtistsAuthService } from './artists-auth.service'

const makeArtistsServiceMock = () =>
  ({
    findByEmail: jest.fn(),
    register: jest.fn(),
    findByUsername: jest.fn(),
    findById: jest.fn(),
  }) as unknown as jest.Mocked<ArtistsService>

const makeArtistsPrivateServiceMock = () =>
  ({
    findByEmail: jest.fn(),
  }) as unknown as jest.Mocked<ArtistsPrivateService>

const makeJwtServiceMock = () =>
  ({
    verifyAsync: jest.fn(),
  }) as unknown as jest.Mocked<JwtService>

const makeTokenServiceMock = () =>
  ({
    generateAccessToken: jest.fn(),
    generateRefreshToken: jest.fn(),
    generateTwoFAPendingToken: jest.fn(),
    getRefreshTokenExpiresAt: jest.fn(),
    hashPassword: jest.fn(),
    hashToken: jest.fn(),
    verifyPassword: jest.fn(),
  }) as unknown as jest.Mocked<TokenService>

const makeMailServiceMock = () =>
  ({
    sendPasswordReset: jest.fn(),
    sendArtistPasswordReset: jest.fn(),
    sendArtistEmailVerification: jest.fn(),
  }) as unknown as jest.Mocked<MailService>

/** The lockout window the service applies once the attempt threshold is reached. */
const LOCK_DURATION_MS = 15 * 60 * 1000

/** The attempt count at which an account is locked. */
const MAX_LOGIN_ATTEMPTS = 5

/** The row shape `recordFailedLogin` reads back after incrementing the counter. */
type AttemptResult = {
  failedLoginAttempts: number
  lockedUntil: Date | null
}

describe('ArtistsAuthService', () => {
  let service: ArtistsAuthService
  let artists: jest.Mocked<ArtistsService>
  let artistsPrivate: jest.Mocked<ArtistsPrivateService>
  let jwtService: jest.Mocked<JwtService>
  let prisma: PrismaMock
  let token: jest.Mocked<TokenService>
  let mail: jest.Mocked<MailService>

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    artists = makeArtistsServiceMock()
    artistsPrivate = makeArtistsPrivateServiceMock()
    jwtService = makeJwtServiceMock()
    token = makeTokenServiceMock()
    mail = makeMailServiceMock()
    service = new ArtistsAuthService(artists, artistsPrivate, jwtService, prisma, token, mail)
  })

  /** Stands in for the atomic increment, which returns the row's new counter value. */
  const mockAttemptResult = (result: AttemptResult | null) => {
    prisma.artist.updateManyAndReturn.mockResolvedValue((result ? [result] : []) as never)
  }

  /** The deadline the service wrote, for an instant-level assertion. */
  const writtenLockedUntil = (): Date | null => {
    const call = prisma.artist.updateMany.mock.calls.at(-1)?.[0]
    const data = call?.data as { lockedUntil?: Date | null } | undefined
    return data?.lockedUntil ?? null
  }

  describe('registerArtist', () => {
    it('should throw ConflictException if email already exists', async () => {
      artists.findByEmail.mockResolvedValue(buildArtist() as never)

      await expect(
        service.registerArtist({
          email: 'artist@example.com',
          password: 'pass',
          username: 'artist',
        }),
      ).rejects.toThrow(ConflictException)
    })

    it('should register artist if email is unique', async () => {
      artists.findByEmail.mockResolvedValue(null as never)
      token.hashPassword.mockResolvedValue('hashed-pass' as never)
      artists.register.mockResolvedValue(
        buildArtist({ email: 'new@example.com', username: 'newartist' }) as never,
      )

      await service.registerArtist({
        email: 'new@example.com',
        password: 'pass',
        username: 'newartist',
      })

      expect(token.hashPassword).toHaveBeenCalledWith('pass')
      expect(artists.register).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'hashed-pass',
        username: 'newartist',
      })
    })
  })

  describe('loginArtist', () => {
    it('should throw UnauthorizedException when artist not found', async () => {
      artistsPrivate.findByEmail.mockResolvedValue(null as never)

      await expect(service.loginArtist('x@example.com', 'pass')).rejects.toThrow(
        UnauthorizedException,
      )
    })

    it('should throw UnauthorizedException when password is wrong', async () => {
      artistsPrivate.findByEmail.mockResolvedValue(buildArtist({ password: 'hash' }) as never)
      token.verifyPassword.mockResolvedValue(false as never)
      mockAttemptResult({ failedLoginAttempts: 1, lockedUntil: null })

      await expect(service.loginArtist('artist@example.com', 'wrong')).rejects.toThrow(
        UnauthorizedException,
      )
      expect(prisma.artist.updateManyAndReturn).toHaveBeenCalledTimes(1)
      expect(prisma.artist.update).not.toHaveBeenCalled()
    })

    it('should return tokens on successful login', async () => {
      const artist = buildArtist({ password: 'hashed-password' })
      artistsPrivate.findByEmail.mockResolvedValue(artist as never)
      token.verifyPassword.mockResolvedValue(true as never)
      token.generateAccessToken.mockResolvedValue('access-token' as never)
      token.generateRefreshToken.mockResolvedValue('refresh-token' as never)
      token.hashToken.mockReturnValue('hashed-token')
      const session = buildArtistSession()
      prisma.artistSession.create.mockResolvedValue(session)

      const result = await service.loginArtist(artist.email, artist.password!)

      expect(token.verifyPassword).toHaveBeenCalledWith(artist.password!, artist.password!)
      expect(result).toEqual({ access_token: 'access-token', refresh_token: 'refresh-token' })
    })
  })

  describe('refresh', () => {
    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('invalid') as never)

      await expect(service.refresh('bad-token')).rejects.toThrow(UnauthorizedException)
    })

    it('should throw UnauthorizedException when artist not found', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: 'artist-1', username: 'artist' } as never)
      artists.findById.mockResolvedValue(null as never)

      await expect(service.refresh('refresh-token')).rejects.toThrow(UnauthorizedException)
    })

    it('should rotate access and refresh tokens on valid refresh', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: 'artist-1', username: 'artist' } as never)
      artists.findById.mockResolvedValue(buildArtist() as never)
      token.generateAccessToken.mockResolvedValue('new-access-token' as never)
      token.generateRefreshToken.mockResolvedValue('new-refresh-token' as never)
      token.hashToken.mockReturnValue('hashed-token')
      prisma.artistSession.updateMany.mockResolvedValue({ count: 1 })

      const result = await service.refresh('refresh-token')

      expect(result).toEqual({
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
      })
      expect(prisma.artistSession.updateMany).toHaveBeenCalled()
    })
  })

  describe('logout', () => {
    it('should throw UnauthorizedException when artist not found', async () => {
      artists.findById.mockResolvedValue(null as never)

      await expect(service.logout('artist-1', 'access-token')).rejects.toThrow(
        UnauthorizedException,
      )
    })

    it('should delete session on valid logout', async () => {
      const artist = buildArtist({ id: 'artist-1' })
      artists.findById.mockResolvedValue(artist as never)
      token.hashToken.mockReturnValue('hashed-token')
      prisma.artistSession.deleteMany.mockResolvedValue({ count: 1 })

      await service.logout('artist-1', 'access-token')

      expect(prisma.artistSession.deleteMany).toHaveBeenCalledWith({
        where: { artistId: artist.id, access_token: 'hashed-token' },
      })
    })
  })

  describe('forgotPassword', () => {
    it('sends the reset link through the artist-specific mail flow', async () => {
      const artist = buildArtist({ id: 'artist-1' })
      artistsPrivate.findByEmail.mockResolvedValue(artist as never)
      token.hashToken.mockReturnValue('hashed-token')
      prisma.artistPasswordReset.create.mockResolvedValue({} as never)

      await service.forgotPassword(artist.email)

      expect(mail.sendArtistPasswordReset).toHaveBeenCalledWith(
        artist.email,
        expect.any(String),
        artist.username,
      )
      expect(mail.sendPasswordReset).not.toHaveBeenCalled()
    })
  })
  describe('failed login lockout', () => {
    const failLogin = async () => {
      artistsPrivate.findByEmail.mockResolvedValue(
        buildArtist({ id: 'artist-1', password: 'hash' }) as never,
      )
      token.verifyPassword.mockResolvedValue(false as never)
      await expect(service.loginArtist('artist@example.com', 'wrong')).rejects.toThrow(
        UnauthorizedException,
      )
    }

    it('increments the attempt counter on every failure', async () => {
      mockAttemptResult({ failedLoginAttempts: 1, lockedUntil: null })

      await failLogin()

      expect(prisma.artist.updateManyAndReturn).toHaveBeenCalledWith({
        where: { id: 'artist-1' },
        data: { failedLoginAttempts: { increment: 1 } },
        select: { failedLoginAttempts: true, lockedUntil: true },
      })
    })

    it('does not lock the account below the threshold', async () => {
      mockAttemptResult({ failedLoginAttempts: MAX_LOGIN_ATTEMPTS - 1, lockedUntil: null })

      await failLogin()

      expect(prisma.artist.updateMany).not.toHaveBeenCalled()
    })

    it('clears a stale lock while the count is below the threshold', async () => {
      mockAttemptResult({ failedLoginAttempts: 1, lockedUntil: new Date() })

      await failLogin()

      expect(prisma.artist.updateMany).toHaveBeenCalledWith({
        where: { id: 'artist-1' },
        data: { lockedUntil: null },
      })
    })

    it('locks the account for the lock duration once the threshold is reached', async () => {
      mockAttemptResult({ failedLoginAttempts: MAX_LOGIN_ATTEMPTS, lockedUntil: null })
      const before = Date.now()

      await failLogin()

      const lockedUntil = writtenLockedUntil()
      expect(lockedUntil).toBeInstanceOf(Date)
      /**
       * The deadline is a real instant, not a wall-clock value that a timezone-dropping
       * cast would have shifted. `loginArtist` compares it against `new Date()`.
       */
      expect((lockedUntil as Date).getTime()).toBeGreaterThanOrEqual(before + LOCK_DURATION_MS)
      expect((lockedUntil as Date).getTime()).toBeLessThanOrEqual(Date.now() + LOCK_DURATION_MS)
    })

    it('is a no-op when the account disappeared mid-request', async () => {
      mockAttemptResult(null)

      await failLogin()

      expect(prisma.artist.updateMany).not.toHaveBeenCalled()
    })
  })
})
