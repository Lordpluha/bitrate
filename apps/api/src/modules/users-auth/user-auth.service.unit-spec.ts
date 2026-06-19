import { beforeEach, describe, expect, it } from '@jest/globals'
import { JwtService } from '@nestjs/jwt'
import { PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { type DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'
import { TokenService } from '../tokens/token.service'
import { buildUser } from '../users/__tests__/fixtures/users.fixtures'
import { UsersPrivateService } from '../users/users.private.service'
import { UsersService } from '../users/users.service'
import { buildUserSession } from './__tests__/fixtures/users-auth.fixtures'
import { UserAuthService } from './user-auth.service'

const createJwtPayload = (overrides: { sub?: string; username?: string } = {}) => ({
  sub: overrides.sub ?? 'user-1',
  username: overrides.username ?? 'user',
})

describe('UserAuthService', () => {
  let service: UserAuthService
  let prisma: PrismaMock
  let users: DeepMockProxy<UsersService>
  let usersPrivate: DeepMockProxy<UsersPrivateService>
  let jwt: DeepMockProxy<JwtService>
  let token: DeepMockProxy<TokenService>

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock

    users = mockDeep<UsersService>()
    usersPrivate = mockDeep<UsersPrivateService>()
    jwt = mockDeep<JwtService>()
    token = mockDeep<TokenService>()

    mockReset(users)
    mockReset(usersPrivate)
    mockReset(jwt)
    mockReset(token)

    service = new UserAuthService(users, usersPrivate, jwt, prisma, token)
  })

  it('registerUser should throw on existing email', async () => {
    users.getByEmail.mockResolvedValue(buildUser())

    await expect(
      service.registerUser({
        email: 'user@example.com',
        password: 'password123',
        username: 'user',
      }),
    ).rejects.toThrow('User with this email already exists')
  })

  it('registerUser should create a new user', async () => {
    users.getByEmail.mockResolvedValue(null)

    await service.registerUser({
      email: 'new@example.com',
      password: 'password123',
      username: 'new-user',
    })

    expect(users.create).toHaveBeenCalledWith({
      username: 'new-user',
      email: 'new@example.com',
      password: 'password123',
      avatar: null,
      description: null,
      updatedAt: expect.any(Date),
    })
  })

  it('loginUser should reject when user not found', async () => {
    usersPrivate.getByEmail.mockResolvedValue(null)

    await expect(service.loginUser('user@example.com', 'password123')).rejects.toThrow(
      'Invalid credentials',
    )
  })

  it('loginUser should reject when password invalid', async () => {
    usersPrivate.getByEmail.mockResolvedValue(buildUser({ password: 'password123' }))

    await expect(service.loginUser('user@example.com', 'bad-pass')).rejects.toThrow(
      'Invalid credentials',
    )
  })

  it('loginUser should return access and refresh tokens', async () => {
    const user = buildUser({ id: 'user-1', username: 'user' })
    usersPrivate.getByEmail.mockResolvedValue(user)

    token.generateAccessToken.mockResolvedValue('access-token')
    token.generateRefreshToken.mockResolvedValue('refresh-token')

    prisma.userSession.create.mockResolvedValue(
      buildUserSession({
        userId: user.id,
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      }),
    )

    const result = await service.loginUser(user.email, user.password)

    expect(token.generateAccessToken).toHaveBeenCalledWith(user.id, user.username)
    expect(token.generateRefreshToken).toHaveBeenCalledWith(user.id, user.username)
    expect(prisma.userSession.create).toHaveBeenCalledWith({
      data: {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        userId: user.id,
      },
    })
    expect(result).toEqual({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
    })
  })

  it('refresh should return new access token', async () => {
    const user = buildUser({ id: 'user-1', username: 'user' })
    jwt.verifyAsync.mockResolvedValue(createJwtPayload())
    users.getByUsername.mockResolvedValue(user)
    token.generateAccessToken.mockResolvedValue('new-access')

    const result = await service.refresh('refresh-token')

    expect(jwt.verifyAsync).toHaveBeenCalled()
    expect(users.getByUsername).toHaveBeenCalledWith('user')
    expect(token.generateAccessToken).toHaveBeenCalledWith(user.id, user.username)
    expect(result).toEqual({ access_token: 'new-access' })
  })

  it('refresh should reject on invalid token', async () => {
    jwt.verifyAsync.mockRejectedValue(new Error('bad token'))

    await expect(service.refresh('bad-token')).rejects.toThrow('Invalid refresh token')
  })

  it('refresh should reject when user not found', async () => {
    jwt.verifyAsync.mockResolvedValue(createJwtPayload())
    users.getByUsername.mockRejectedValue(new Error('User not found'))

    await expect(service.refresh('refresh-token')).rejects.toThrow('Invalid refresh token')
  })

  it('logout should reject when user not found', async () => {
    users.findById.mockRejectedValue(new Error('User not found'))

    await expect(service.logout('user-1', 'refresh-token')).rejects.toThrow('User not found')
  })

  it('logout should delete session', async () => {
    const user = buildUser({ id: 'user-1' })
    users.findById.mockResolvedValue(user)
    prisma.userSession.findFirst.mockResolvedValue(
      buildUserSession({
        userId: user.id,
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      }),
    )

    await service.logout(user.id, 'refresh-token')

    expect(prisma.userSession.findFirst).toHaveBeenCalledWith({
      where: {
        userId: user.id,
        refresh_token: 'refresh-token',
      },
    })
    expect(prisma.userSession.delete).toHaveBeenCalledWith({
      where: { id: 'session-1' },
    })
  })
})
