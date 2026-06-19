import type { AppConfig } from '@common/config'
import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Test, type TestingModule } from '@nestjs/testing'
import { TokenService } from './token.service'

const makeJwtServiceMock = () =>
  ({
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  }) as unknown as jest.Mocked<JwtService>

const makeConfigServiceMock = () =>
  ({
    getOrThrow: jest.fn().mockImplementation((key: unknown) => {
      const config: Record<string, string> = {
        JWT_ACCESS_EXPIRES_IN: '15m',
        JWT_REFRESH_EXPIRES_IN: '7d',
        JWT_SECRET: 'test-secret',
        ACCESS_TOKEN_NAME: 'access_token',
        REFRESH_TOKEN_NAME: 'refresh_token',
      }
      return config[key as string] ?? {}
    }),
  }) as unknown as jest.Mocked<ConfigService<AppConfig>>

describe('TokenService (int)', () => {
  let service: TokenService
  let module: TestingModule
  let jwtService: jest.Mocked<JwtService>
  let configService: jest.Mocked<ConfigService<AppConfig>>

  beforeAll(async () => {
    jwtService = makeJwtServiceMock()
    configService = makeConfigServiceMock()

    module = await Test.createTestingModule({
      providers: [
        TokenService,
        { provide: JwtService, useValue: jwtService },
        { provide: 'ConfigService', useValue: configService },
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(configService)
      .compile()

    service = module.get(TokenService)
  })

  afterAll(() => module.close())

  it('should be defined via DI', () => {
    expect(service).toBeDefined()
  })

  it('generateAccessToken should call jwtService.signAsync with correct args', async () => {
    jwtService.signAsync.mockResolvedValue('access-token' as never)

    const result = await service.generateAccessToken('user-1', 'user')

    expect(jwtService.signAsync).toHaveBeenCalledWith(
      { username: 'user' },
      { subject: 'user-1', expiresIn: '15m', secret: 'test-secret' },
    )
    expect(result).toBe('access-token')
  })

  it('generateRefreshToken should call jwtService.signAsync with refresh expiry', async () => {
    jwtService.signAsync.mockResolvedValue('refresh-token' as never)

    const result = await service.generateRefreshToken('user-1', 'user')

    expect(jwtService.signAsync).toHaveBeenCalledWith(
      { username: 'user' },
      { subject: 'user-1', expiresIn: '7d', secret: 'test-secret' },
    )
    expect(result).toBe('refresh-token')
  })

  it('verifyToken should call jwtService.verifyAsync with secret', async () => {
    const payload = { sub: 'user-1', username: 'user' }
    jwtService.verifyAsync.mockResolvedValue(payload as never)

    const result = await service.verifyToken('some-token')

    expect(jwtService.verifyAsync).toHaveBeenCalledWith('some-token', { secret: 'test-secret' })
    expect(result).toEqual(payload)
  })

  it('setAuthCookies should call res.cookie for both tokens', () => {
    const res = { cookie: jest.fn() } as never

    service.setAuthCookies(res, 'at', 'rt')

    expect((res as { cookie: jest.Mock }).cookie).toHaveBeenCalledTimes(2)
    expect((res as { cookie: jest.Mock }).cookie).toHaveBeenCalledWith(
      'access_token',
      'at',
      expect.any(Object),
    )
    expect((res as { cookie: jest.Mock }).cookie).toHaveBeenCalledWith(
      'refresh_token',
      'rt',
      expect.any(Object),
    )
  })

  it('clearAuthCookies should call res.clearCookie for both tokens', () => {
    const res = { clearCookie: jest.fn() } as never

    service.clearAuthCookies(res)

    expect((res as { clearCookie: jest.Mock }).clearCookie).toHaveBeenCalledWith('access_token')
    expect((res as { clearCookie: jest.Mock }).clearCookie).toHaveBeenCalledWith('refresh_token')
  })
})
