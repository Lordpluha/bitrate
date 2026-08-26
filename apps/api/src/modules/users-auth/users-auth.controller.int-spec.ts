import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { TokenService } from '@modules/tokens/token.service'
import { buildUser } from '@modules/users/__tests__/fixtures/users.fixtures'
import { UsersService } from '@modules/users/users.service'
import type { INestApplication } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { OAuthService } from './oauth.service'
import { TwoFactorService } from './two-factor.service'
import { UserAuthService } from './user-auth.service'
import { UsersAuthController } from './users-auth.controller'
import { UserAuthGuard } from './users-auth.guard'

const makeAuthServiceMock = () =>
  ({
    loginUser: jest.fn(),
    registerUser: jest.fn(),
    logout: jest.fn(),
    refresh: jest.fn(),
  }) as unknown as jest.Mocked<UserAuthService>

const makeUsersServiceMock = () =>
  ({
    findById: jest.fn(),
    findSelfById: jest.fn(),
  }) as unknown as jest.Mocked<UsersService>

const makeTokenServiceMock = () =>
  ({
    setAuthCookies: jest.fn(),
    clearAuthCookies: jest.fn(),
  }) as unknown as jest.Mocked<TokenService>

describe('UsersAuthController (int)', () => {
  let app: INestApplication
  let authService: jest.Mocked<UserAuthService>
  let usersService: jest.Mocked<UsersService>
  let tokenService: jest.Mocked<TokenService>
  const user = buildUser()

  beforeAll(async () => {
    authService = makeAuthServiceMock()
    usersService = makeUsersServiceMock()
    tokenService = makeTokenServiceMock()

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersAuthController],
      providers: [
        { provide: UserAuthService, useValue: authService },
        { provide: UsersService, useValue: usersService },
        { provide: TokenService, useValue: tokenService },
        { provide: OAuthService, useValue: {} },
        { provide: TwoFactorService, useValue: {} },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    })
      .overrideGuard(UserAuthGuard)
      .useValue({
        canActivate: (ctx: {
          switchToHttp: () => { getRequest: () => Record<string, unknown> }
        }) => {
          const req = ctx.switchToHttp().getRequest()
          req.user = user
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
    authService.loginUser.mockReset()
    authService.registerUser.mockReset()
    authService.logout.mockReset()
    authService.refresh.mockReset()
    usersService.findSelfById.mockReset()
  })

  it('POST /auth/registration should return 201', async () => {
    authService.registerUser.mockResolvedValue(undefined as never)

    const res = await request(app.getHttpServer()).post('/auth/registration').send({
      email: 'new@example.com',
      password: 'password123',
      username: 'newuser',
    })

    expect(res.status).toBe(201)
  })

  it('POST /auth/login should return 201 on valid credentials', async () => {
    authService.loginUser.mockResolvedValue({
      access_token: 'at',
      refresh_token: 'rt',
    } as never)

    const res = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'user@example.com',
      password: 'hashed-password',
    })

    expect(res.status).toBe(201)
    expect(authService.loginUser).toHaveBeenCalledWith('user@example.com', 'hashed-password')
  })

  it('POST /auth/logout should return 201', async () => {
    authService.logout.mockResolvedValue(undefined as never)

    const res = await request(app.getHttpServer()).post('/auth/logout')

    expect(res.status).toBe(201)
  })

  it('GET /auth/me should return 200 with user', async () => {
    usersService.findSelfById.mockResolvedValue(user as never)

    const res = await request(app.getHttpServer()).get('/auth/me')

    expect(res.status).toBe(200)
    expect(usersService.findSelfById).toHaveBeenCalledWith(user.id)
  })

  it('POST /auth/refresh should return 201 and set new cookies', async () => {
    authService.refresh.mockResolvedValue({ access_token: 'new-at' } as never)

    const res = await request(app.getHttpServer()).post('/auth/refresh')

    expect(res.status).toBe(201)
    expect(authService.refresh).toHaveBeenCalledWith('rt')
    expect(tokenService.setAuthCookies).toHaveBeenCalled()
  })
})
