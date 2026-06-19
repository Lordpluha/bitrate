import { PrismaService } from '@infra/prisma/prisma.service'
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { buildArtist } from '@modules/artists/__tests__/fixtures/artists.fixtures'
import { ArtistsPrivateService } from '@modules/artists/artists.private.service'
import { ArtistsService } from '@modules/artists/artists.service'
import { TokenService } from '@modules/tokens/token.service'
import { ConflictException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test, type TestingModule } from '@nestjs/testing'
import { prismaMock, resetPrismaMock } from '@test/mocks'
import { buildArtistSession } from './__tests__/fixtures/artists-auth.fixtures'
import { ArtistsAuthService } from './artists-auth.service'

const makeArtistsServiceMock = () =>
  ({
    findByEmail: jest.fn(),
    register: jest.fn(),
    findByUsername: jest.fn(),
    findById: jest.fn(),
  }) as unknown as jest.Mocked<ArtistsService>

const makeArtistsPrivateMock = () =>
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
  }) as unknown as jest.Mocked<TokenService>

describe('ArtistsAuthService (int)', () => {
  let service: ArtistsAuthService
  let module: TestingModule
  let artistsMock: jest.Mocked<ArtistsService>
  let artistsPrivateMock: jest.Mocked<ArtistsPrivateService>
  let jwtMock: jest.Mocked<JwtService>
  let tokenMock: jest.Mocked<TokenService>

  beforeAll(async () => {
    artistsMock = makeArtistsServiceMock()
    artistsPrivateMock = makeArtistsPrivateMock()
    jwtMock = makeJwtServiceMock()
    tokenMock = makeTokenServiceMock()

    module = await Test.createTestingModule({
      providers: [
        ArtistsAuthService,
        { provide: ArtistsService, useValue: artistsMock },
        { provide: ArtistsPrivateService, useValue: artistsPrivateMock },
        { provide: JwtService, useValue: jwtMock },
        { provide: PrismaService, useValue: prismaMock },
        { provide: TokenService, useValue: tokenMock },
      ],
    }).compile()

    service = module.get(ArtistsAuthService)
  })

  afterAll(() => module.close())

  beforeEach(() => {
    resetPrismaMock()
    artistsMock.findByEmail.mockReset()
    artistsMock.register.mockReset()
    artistsMock.findByUsername.mockReset()
    artistsMock.findById.mockReset()
    artistsPrivateMock.findByEmail.mockReset()
    jwtMock.verifyAsync.mockReset()
    tokenMock.generateAccessToken.mockReset()
    tokenMock.generateRefreshToken.mockReset()
  })

  it('should be defined via DI', () => {
    expect(service).toBeDefined()
  })

  it('registerArtist should throw ConflictException when email exists', async () => {
    artistsMock.findByEmail.mockResolvedValue(buildArtist() as never)

    await expect(
      service.registerArtist({ email: 'a@example.com', password: 'p', username: 'a' }),
    ).rejects.toThrow(ConflictException)
  })

  it('loginArtist should throw UnauthorizedException when password is wrong', async () => {
    artistsPrivateMock.findByEmail.mockResolvedValue(buildArtist({ password: 'correct' }) as never)

    await expect(service.loginArtist('a@example.com', 'wrong')).rejects.toThrow(
      UnauthorizedException,
    )
  })

  it('loginArtist should return tokens on valid credentials', async () => {
    const artist = buildArtist()
    artistsPrivateMock.findByEmail.mockResolvedValue(artist as never)
    tokenMock.generateAccessToken.mockResolvedValue('at' as never)
    tokenMock.generateRefreshToken.mockResolvedValue('rt' as never)
    prismaMock.artistSession.create.mockResolvedValue(buildArtistSession() as never)

    const result = await service.loginArtist(artist.email, artist.password)

    expect(result).toEqual({ access_token: 'access-token', refresh_token: 'refresh-token' })
  })

  it('refresh should throw UnauthorizedException on invalid token', async () => {
    jwtMock.verifyAsync.mockRejectedValue(new Error('invalid') as never)

    await expect(service.refresh('bad-token')).rejects.toThrow(UnauthorizedException)
  })

  it('logout should throw UnauthorizedException when artist not found', async () => {
    artistsMock.findById.mockResolvedValue(null as never)

    await expect(service.logout('artist-1', 'rt')).rejects.toThrow(UnauthorizedException)
  })
})
