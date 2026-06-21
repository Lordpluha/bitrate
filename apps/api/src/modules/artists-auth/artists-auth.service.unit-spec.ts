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
    hashPassword: jest.fn(),
    hashToken: jest.fn(),
    verifyPassword: jest.fn(),
  }) as unknown as jest.Mocked<TokenService>

const makeMailServiceMock = () =>
  ({
    sendPasswordReset: jest.fn(),
  }) as unknown as jest.Mocked<MailService>

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
      artists.register.mockResolvedValue(undefined as never)

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

      await expect(service.loginArtist('artist@example.com', 'wrong')).rejects.toThrow(
        UnauthorizedException,
      )
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
      artists.findByUsername.mockResolvedValue(null as never)

      await expect(service.refresh('refresh-token')).rejects.toThrow(UnauthorizedException)
    })

    it('should return new access_token on valid refresh', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: 'artist-1', username: 'artist' } as never)
      artists.findByUsername.mockResolvedValue(buildArtist() as never)
      token.generateAccessToken.mockResolvedValue('new-access-token' as never)
      token.hashToken.mockReturnValue('hashed-token')
      prisma.artistSession.updateMany.mockResolvedValue({ count: 1 })

      const result = await service.refresh('refresh-token')

      expect(result).toEqual({ access_token: 'new-access-token' })
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
})
