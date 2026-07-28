import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { buildArtist } from '@modules/artists/__tests__/fixtures/artists.fixtures'
import { ArtistsService } from '@modules/artists/artists.service'
import { TokenService } from '@modules/tokens/token.service'
import type { INestApplication } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { AuthController } from './artists-auth.controller'
import { ArtistAuthGuard } from './artists-auth.guard'
import { ArtistsAuthService } from './artists-auth.service'

const makeAuthServiceMock = () =>
  ({
    loginArtist: jest.fn(),
    registerArtist: jest.fn(),
    logout: jest.fn(),
    refresh: jest.fn(),
  }) as unknown as jest.Mocked<ArtistsAuthService>

const makeArtistsServiceMock = () =>
  ({
    findById: jest.fn(),
  }) as unknown as jest.Mocked<ArtistsService>

const makeTokenServiceMock = () =>
  ({
    setAuthCookies: jest.fn(),
    clearAuthCookies: jest.fn(),
  }) as unknown as jest.Mocked<TokenService>

describe('AuthController artists (int)', () => {
  let app: INestApplication
  let authService: jest.Mocked<ArtistsAuthService>
  let artistsService: jest.Mocked<ArtistsService>
  let tokenService: jest.Mocked<TokenService>
  const artist = buildArtist()

  beforeAll(async () => {
    authService = makeAuthServiceMock()
    artistsService = makeArtistsServiceMock()
    tokenService = makeTokenServiceMock()

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: ArtistsAuthService, useValue: authService },
        { provide: ArtistsService, useValue: artistsService },
        { provide: TokenService, useValue: tokenService },
      ],
    })
      .overrideGuard(ArtistAuthGuard)
      .useValue({
        canActivate: (ctx: {
          switchToHttp: () => { getRequest: () => Record<string, unknown> }
        }) => {
          const req = ctx.switchToHttp().getRequest()
          req.artist = artist
          req.user = artist
          req[process.env.ACCESS_TOKEN_NAME ?? 'access_token'] = 'at'
          req[process.env.REFRESH_TOKEN_NAME ?? 'refresh_token'] = 'rt'
          return true
        },
      })
      .compile()

    app = module.createNestApplication()
    await app.init()
  })

  afterAll(() => app.close())

  beforeEach(() => {
    authService.loginArtist.mockReset()
    authService.registerArtist.mockReset()
    authService.logout.mockReset()
    authService.refresh.mockReset()
    artistsService.findById.mockReset()
  })

  it('POST /artists/auth/registration should return 201', async () => {
    authService.registerArtist.mockResolvedValue(undefined as never)

    const res = await request(app.getHttpServer()).post('/artists/auth/registration').send({
      email: 'new@example.com',
      password: 'password123',
      username: 'newartist',
    })

    expect(res.status).toBe(201)
  })

  it('POST /artists/auth/login should return 201 on valid credentials', async () => {
    authService.loginArtist.mockResolvedValue({ access_token: 'at', refresh_token: 'rt' } as never)

    const res = await request(app.getHttpServer()).post('/artists/auth/login').send({
      email: 'artist@example.com',
      password: 'hashed-password',
    })

    expect(res.status).toBe(201)
    expect(authService.loginArtist).toHaveBeenCalledWith('artist@example.com', 'hashed-password')
  })

  it('POST /artists/auth/logout should return 201', async () => {
    authService.logout.mockResolvedValue(undefined as never)

    const res = await request(app.getHttpServer()).post('/artists/auth/logout')

    expect(res.status).toBe(201)
  })

  it('GET /artists/auth/me should return artist', async () => {
    artistsService.findById.mockResolvedValue(artist as never)

    const res = await request(app.getHttpServer()).get('/artists/auth/me')

    expect(res.status).toBe(200)
    expect(artistsService.findById).toHaveBeenCalledWith(artist.id)
  })

  it('POST /artists/auth/refresh should return 201 and set new cookies', async () => {
    authService.refresh.mockResolvedValue({ access_token: 'new-at' } as never)

    const res = await request(app.getHttpServer()).post('/artists/auth/refresh')

    expect(res.status).toBe(201)
    expect(authService.refresh).toHaveBeenCalledWith('rt')
    expect(tokenService.setAuthCookies).toHaveBeenCalled()
  })
})
