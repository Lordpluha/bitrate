import { MailService } from '@infra/mail/mail.service'
import { PrismaService } from '@infra/prisma/prisma.service'
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { TokenService } from '@modules/tokens/token.service'
import { buildUser } from '@modules/users/__tests__/fixtures/users.fixtures'
import { UsersPrivateService } from '@modules/users/users.private.service'
import { UsersService } from '@modules/users/users.service'
import { buildUserSession } from '@modules/users-auth/__tests__/fixtures/users-auth.fixtures'
import { ConflictException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test, type TestingModule } from '@nestjs/testing'
import { prismaMock, resetPrismaMock } from '@test/mocks'
import { UserAuthService } from './user-auth.service'

const makeUsersServiceMock = () =>
  ({
    getByEmail: jest.fn(),
    create: jest.fn(),
    getByUsername: jest.fn(),
    findById: jest.fn(),
  }) as unknown as jest.Mocked<UsersService>

const makeUsersPrivateMock = () =>
  ({
    getByEmail: jest.fn(),
  }) as unknown as jest.Mocked<UsersPrivateService>

const makeJwtServiceMock = () =>
  ({
    verifyAsync: jest.fn(),
  }) as unknown as jest.Mocked<JwtService>

const makeTokenServiceMock = () =>
  ({
    generateAccessToken: jest.fn(),
    generateRefreshToken: jest.fn(),
    hashPassword: jest.fn(),
    verifyPassword: jest.fn(),
    hashToken: jest.fn(),
    getRefreshTokenExpiresAt: jest.fn(() => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
  }) as unknown as jest.Mocked<TokenService>

describe('UserAuthService (int)', () => {
  let service: UserAuthService
  let module: TestingModule
  let usersMock: jest.Mocked<UsersService>
  let usersPrivateMock: jest.Mocked<UsersPrivateService>
  let jwtMock: jest.Mocked<JwtService>
  let tokenMock: jest.Mocked<TokenService>

  beforeAll(async () => {
    usersMock = makeUsersServiceMock()
    usersPrivateMock = makeUsersPrivateMock()
    jwtMock = makeJwtServiceMock()
    tokenMock = makeTokenServiceMock()

    module = await Test.createTestingModule({
      providers: [
        UserAuthService,
        { provide: UsersService, useValue: usersMock },
        { provide: UsersPrivateService, useValue: usersPrivateMock },
        { provide: JwtService, useValue: jwtMock },
        { provide: PrismaService, useValue: prismaMock },
        { provide: TokenService, useValue: tokenMock },
        {
          provide: MailService,
          useValue: { sendVerificationEmail: jest.fn(), sendPasswordResetEmail: jest.fn() },
        },
      ],
    }).compile()

    service = module.get(UserAuthService)
  })

  afterAll(() => module.close())

  beforeEach(() => {
    resetPrismaMock()
    usersMock.getByEmail.mockReset()
    usersMock.create.mockReset()
    usersMock.getByUsername.mockReset()
    usersMock.findById.mockReset()
    usersPrivateMock.getByEmail.mockReset()
    jwtMock.verifyAsync.mockReset()
    tokenMock.generateAccessToken.mockReset()
    tokenMock.generateRefreshToken.mockReset()
  })

  it('should be defined via DI', () => {
    expect(service).toBeDefined()
  })

  it('registerUser should throw ConflictException when email exists', async () => {
    usersMock.getByEmail.mockResolvedValue(buildUser() as never)

    await expect(
      service.registerUser({ email: 'u@example.com', password: 'p', username: 'u' }),
    ).rejects.toThrow(ConflictException)
  })

  it('loginUser should throw UnauthorizedException when password is wrong', async () => {
    usersPrivateMock.getByEmail.mockResolvedValue(buildUser({ password: 'correct' }) as never)
    tokenMock.verifyPassword.mockResolvedValue(false as never)

    await expect(service.loginUser('u@example.com', 'wrong')).rejects.toThrow(UnauthorizedException)
  })

  it('loginUser should return tokens on valid credentials', async () => {
    const user = buildUser()
    usersPrivateMock.getByEmail.mockResolvedValue(user as never)
    tokenMock.verifyPassword.mockResolvedValue(true as never)
    tokenMock.generateAccessToken.mockResolvedValue('at' as never)
    tokenMock.generateRefreshToken.mockResolvedValue('rt' as never)
    prismaMock.userSession.create.mockResolvedValue(buildUserSession() as never)

    const result = await service.loginUser(user.email, user.password!)

    expect(result).toEqual({ access_token: 'at', refresh_token: 'rt' })
  })

  it('refresh should throw UnauthorizedException on invalid token', async () => {
    jwtMock.verifyAsync.mockRejectedValue(new Error('invalid') as never)

    await expect(service.refresh('bad-token')).rejects.toThrow(UnauthorizedException)
  })
})
