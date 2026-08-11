import type { MailService } from '@infra/mail/mail.service'
import { beforeEach, describe, expect, it } from '@jest/globals'
import { BadRequestException } from '@nestjs/common'
import type { JwtService } from '@nestjs/jwt'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { type DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'
import type { TokenService } from '../tokens/token.service'
import { buildUser } from '../users/__tests__/fixtures/users.fixtures'
import type { UsersPrivateService } from '../users/users.private.service'
import type { UsersService } from '../users/users.service'
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
  let mail: DeepMockProxy<MailService>

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock

    users = mockDeep<UsersService>()
    usersPrivate = mockDeep<UsersPrivateService>()
    jwt = mockDeep<JwtService>()
    token = mockDeep<TokenService>()
    mail = mockDeep<MailService>()

    mockReset(users)
    mockReset(usersPrivate)
    mockReset(jwt)
    mockReset(token)
    mockReset(mail)

    service = new UserAuthService(users, usersPrivate, jwt, prisma, token, mail)
  })

  describe('registerUser', () => {
    it('should throw on existing email', async () => {
      users.getByEmail.mockResolvedValue(buildUser())

      await expect(
        service.registerUser({
          email: 'user@example.com',
          password: 'password123',
          username: 'user',
        }),
      ).rejects.toThrow('User with this email already exists')
    })

    it('should create a new user', async () => {
      users.getByEmail.mockResolvedValue(null)
      token.hashPassword.mockResolvedValue('hashed')
      users.create.mockResolvedValue(buildUser({ email: 'new@example.com', username: 'new-user' }))

      await service.registerUser({
        email: 'new@example.com',
        password: 'password123',
        username: 'new-user',
      })

      expect(users.create).toHaveBeenCalledWith(
        expect.objectContaining({ username: 'new-user', email: 'new@example.com' }),
      )
    })
  })

  describe('loginUser', () => {
    it('should reject when user not found', async () => {
      usersPrivate.getByEmail.mockResolvedValue(null)

      await expect(service.loginUser('user@example.com', 'password123')).rejects.toThrow(
        'Invalid credentials',
      )
    })

    it('should reject when user has no password (OAuth account)', async () => {
      usersPrivate.getByEmail.mockResolvedValue(buildUser({ password: null }))

      await expect(service.loginUser('user@example.com', 'any')).rejects.toThrow(
        'Invalid credentials',
      )
    })

    it('should reject when password is invalid', async () => {
      usersPrivate.getByEmail.mockResolvedValue(buildUser({ password: 'hash' }))
      token.verifyPassword.mockResolvedValue(false)

      await expect(service.loginUser('user@example.com', 'bad-pass')).rejects.toThrow(
        'Invalid credentials',
      )
    })

    it('should return access and refresh tokens when credentials valid', async () => {
      const user = buildUser({ id: 'user-1', username: 'user', password: 'hash' })
      usersPrivate.getByEmail.mockResolvedValue(user)
      token.verifyPassword.mockResolvedValue(true)
      token.generateAccessToken.mockResolvedValue('access-token')
      token.generateRefreshToken.mockResolvedValue('refresh-token')
      token.hashToken.mockReturnValue('hashed-token')
      prisma.userSession.create.mockResolvedValue(buildUserSession({ userId: user.id }))

      const result = await service.loginUser(user.email, 'correct-pass')

      expect(token.verifyPassword).toHaveBeenCalledWith('correct-pass', 'hash')
      expect(token.generateAccessToken).toHaveBeenCalledWith(user.id, user.username, 'user')
      expect(token.generateRefreshToken).toHaveBeenCalledWith(user.id, user.username, 'user')
      expect(result).toEqual({ access_token: 'access-token', refresh_token: 'refresh-token' })
    })

    it('should return requires2fa and pendingToken when 2FA is enabled', async () => {
      const user = buildUser({ twoFactorEnabled: true, password: 'hash' })
      usersPrivate.getByEmail.mockResolvedValue(user)
      token.verifyPassword.mockResolvedValue(true)
      token.generateTwoFAPendingToken.mockResolvedValue('pending-token')

      const result = await service.loginUser(user.email, 'correct-pass')

      expect(token.generateTwoFAPendingToken).toHaveBeenCalledWith(user.id)
      expect(result).toEqual({ requires2fa: true, pendingToken: 'pending-token' })
    })
  })

  describe('refresh', () => {
    it('should rotate access and refresh tokens', async () => {
      const user = buildUser({ id: 'user-1', username: 'user' })
      jwt.verifyAsync.mockResolvedValue(createJwtPayload())
      users.findById.mockResolvedValue(user)
      prisma.userSession.updateMany.mockResolvedValue({ count: 1 })
      token.generateAccessToken.mockResolvedValue('new-access')
      token.generateRefreshToken.mockResolvedValue('new-refresh')
      token.hashToken.mockReturnValue('hashed-token')

      const result = await service.refresh('refresh-token')

      expect(result).toEqual({ access_token: 'new-access', refresh_token: 'new-refresh' })
      expect(prisma.userSession.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            access_token: 'hashed-token',
            refresh_token: 'hashed-token',
          }),
        }),
      )
    })

    it('should reject on invalid token', async () => {
      jwt.verifyAsync.mockRejectedValue(new Error('bad token'))

      await expect(service.refresh('bad-token')).rejects.toThrow('Invalid refresh token')
    })

    it('should reject when user not found', async () => {
      jwt.verifyAsync.mockResolvedValue(createJwtPayload())
      users.findById.mockRejectedValue(new Error('User not found'))

      await expect(service.refresh('refresh-token')).rejects.toThrow('Invalid refresh token')
    })
  })

  describe('logout', () => {
    it('should reject when user not found', async () => {
      users.findById.mockRejectedValue(new Error('User not found'))

      await expect(service.logout('user-1', 'refresh-token')).rejects.toThrow('User not found')
    })

    it('should delete session', async () => {
      const user = buildUser({ id: 'user-1' })
      users.findById.mockResolvedValue(user)
      token.hashToken.mockReturnValue('hashed-token')

      await service.logout(user.id, 'access-token')

      expect(prisma.userSession.deleteMany).toHaveBeenCalledWith({
        where: { userId: user.id, access_token: 'hashed-token' },
      })
    })
  })

  describe('forgotPassword', () => {
    it('should silently return when user not found', async () => {
      usersPrivate.getByEmail.mockResolvedValue(null)

      await expect(service.forgotPassword('unknown@example.com')).resolves.toBeUndefined()
      expect(prisma.userPasswordReset.create).not.toHaveBeenCalled()
    })

    it('should create reset token and send email', async () => {
      const user = buildUser({ id: 'user-1', email: 'user@example.com', username: 'user' })
      usersPrivate.getByEmail.mockResolvedValue(user)
      token.hashToken.mockReturnValue('hashed-token')
      prisma.userPasswordReset.deleteMany.mockResolvedValue({ count: 0 })
      prisma.userPasswordReset.create.mockResolvedValue({} as never)

      await service.forgotPassword('user@example.com')

      expect(prisma.userPasswordReset.deleteMany).toHaveBeenCalledWith({
        where: { userId: user.id },
      })
      expect(prisma.userPasswordReset.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ userId: user.id, token: 'hashed-token' }),
        }),
      )
      expect(mail.sendPasswordReset).toHaveBeenCalledWith(
        user.email,
        expect.any(String),
        user.username,
      )
    })
  })

  describe('resetPassword', () => {
    it('should throw when token not found', async () => {
      token.hashToken.mockReturnValue('hashed-token')
      prisma.userPasswordReset.findUnique.mockResolvedValue(null)

      await expect(service.resetPassword('raw-token', 'newpass')).rejects.toThrow(
        BadRequestException,
      )
    })

    it('should throw when token expired', async () => {
      token.hashToken.mockReturnValue('hashed-token')
      prisma.userPasswordReset.findUnique.mockResolvedValue({
        id: 'r-1',
        userId: 'user-1',
        token: 'hashed-token',
        expiresAt: new Date(Date.now() - 1000),
        createdAt: new Date(),
      })

      await expect(service.resetPassword('raw-token', 'newpass')).rejects.toThrow(
        'Invalid or expired reset token',
      )
    })

    it('should update password and delete reset record', async () => {
      token.hashToken.mockReturnValue('hashed-token')
      token.hashPassword.mockResolvedValue('new-hashed')
      prisma.userPasswordReset.findUnique.mockResolvedValue({
        id: 'r-1',
        userId: 'user-1',
        token: 'hashed-token',
        expiresAt: new Date(Date.now() + 60_000),
        createdAt: new Date(),
      })
      prisma.$transaction.mockResolvedValue([{}, {}, {}] as never)

      await service.resetPassword('raw-token', 'newpass')

      expect(token.hashPassword).toHaveBeenCalledWith('newpass')
      expect(prisma.$transaction).toHaveBeenCalled()
    })
  })

  describe('completeTwoFactorLogin', () => {
    it('should create a session and return tokens', async () => {
      const user = buildUser({ id: 'user-1', username: 'user' })
      usersPrivate.findById.mockResolvedValue(user)
      token.generateAccessToken.mockResolvedValue('access-token')
      token.generateRefreshToken.mockResolvedValue('refresh-token')
      token.hashToken.mockReturnValue('hashed-token')
      prisma.userSession.create.mockResolvedValue(buildUserSession({ userId: user.id }))

      const result = await service.completeTwoFactorLogin(user.id)

      expect(token.generateAccessToken).toHaveBeenCalledWith(user.id, user.username, 'user')
      expect(result).toEqual({ access_token: 'access-token', refresh_token: 'refresh-token' })
    })
  })
})
