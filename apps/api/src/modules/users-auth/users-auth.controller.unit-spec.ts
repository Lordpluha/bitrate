import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import type { Request, Response } from 'express'

jest.mock('otplib', () => ({
  generateSecret: jest.fn(),
  generateURI: jest.fn(),
  verify: jest.fn(),
}))
jest.mock('qrcode', () => ({ toDataURL: jest.fn() }))

import { type DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'
import type { TokenService } from '../tokens/token.service'
import { buildUser } from '../users/__tests__/fixtures/users.fixtures'
import type { UsersService } from '../users/users.service'
import type { OAuthService } from './oauth.service'
import type { TwoFactorService } from './two-factor.service'
import type { UserAuthService } from './user-auth.service'
import { UsersAuthController } from './users-auth.controller'

const createResponse = (): DeepMockProxy<Response> => mockDeep<Response>()

describe('UsersAuthController', () => {
  let controller: UsersAuthController
  let authService: DeepMockProxy<UserAuthService>
  let oauthService: DeepMockProxy<OAuthService>
  let twoFactorService: DeepMockProxy<TwoFactorService>
  let usersService: DeepMockProxy<UsersService>
  let tokenService: DeepMockProxy<TokenService>

  beforeEach(() => {
    authService = mockDeep<UserAuthService>()
    oauthService = mockDeep<OAuthService>()
    twoFactorService = mockDeep<TwoFactorService>()
    usersService = mockDeep<UsersService>()
    tokenService = mockDeep<TokenService>()

    mockReset(authService)
    mockReset(oauthService)
    mockReset(twoFactorService)
    mockReset(usersService)
    mockReset(tokenService)

    controller = new UsersAuthController(
      authService,
      oauthService,
      twoFactorService,
      usersService,
      tokenService,
    )
  })

  describe('login', () => {
    it('should set cookies when credentials are valid', async () => {
      authService.loginUser.mockResolvedValue({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      })
      const res = createResponse()

      await controller.login({ email: 'user@example.com', password: 'password123' }, res)

      expect(authService.loginUser).toHaveBeenCalledWith('user@example.com', 'password123')
      expect(tokenService.setAuthCookies).toHaveBeenCalledWith(res, 'access-token', 'refresh-token')
    })

    it('should return requires2fa flag and set pending cookie when 2FA is enabled', async () => {
      authService.loginUser.mockResolvedValue({ requires2fa: true, pendingToken: 'pending-token' })
      const res = createResponse()

      const result = await controller.login(
        { email: 'user@example.com', password: 'password123' },
        res,
      )

      expect(tokenService.setAuthCookies).not.toHaveBeenCalled()
      expect((res.cookie as unknown as jest.Mock).mock.calls[0]).toEqual([
        'pending_2fa_token',
        'pending-token',
        expect.objectContaining({ httpOnly: true }),
      ])
      expect(result).toEqual({ requires2fa: true })
    })
  })

  describe('registration', () => {
    it('should call auth service', async () => {
      await controller.registration({
        email: 'new@example.com',
        password: 'password123',
        username: 'new-user',
      })

      expect(authService.registerUser).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
        username: 'new-user',
      })
    })
  })

  describe('logout', () => {
    it('should call auth service and clear cookies', async () => {
      process.env.ACCESS_TOKEN_NAME = 'access_token'
      const user = buildUser({ id: 'user-1' })
      const req = mockDeep<Request>()
      Object.assign(req, { user, access_token: 'access-token' })
      const res = createResponse()

      await controller.logout(req, res)

      expect(authService.logout).toHaveBeenCalledWith('user-1', 'access-token')
      expect(tokenService.clearAuthCookies).toHaveBeenCalledWith(res)
    })
  })

  describe('refresh', () => {
    it('should set new access token', async () => {
      process.env.REFRESH_TOKEN_NAME = 'refresh_token'
      authService.refresh.mockResolvedValue({ access_token: 'new-access' })
      const req = mockDeep<Request>()
      Object.assign(req, { refresh_token: 'refresh-token' })
      const res = createResponse()

      await controller.refresh(req, res)

      expect(authService.refresh).toHaveBeenCalledWith('refresh-token')
      expect(tokenService.setAuthCookies).toHaveBeenCalledWith(res, 'new-access', 'refresh-token')
    })
  })

  describe('getMe', () => {
    it('should return user by id', async () => {
      const user = buildUser({ id: 'user-1' })
      usersService.findById.mockResolvedValue(user)
      const req = mockDeep<Request>()
      Object.assign(req, { user })

      const result = await controller.getMe(req)

      expect(usersService.findById).toHaveBeenCalledWith('user-1')
      expect(result).toBe(user)
    })
  })

  describe('forgotPassword', () => {
    it('should call auth service', async () => {
      await controller.forgotPassword({ email: 'user@example.com' })

      expect(authService.forgotPassword).toHaveBeenCalledWith('user@example.com')
    })
  })

  describe('resetPassword', () => {
    it('should call auth service', async () => {
      await controller.resetPassword({ token: 'raw-token', password: 'newpass123' })

      expect(authService.resetPassword).toHaveBeenCalledWith('raw-token', 'newpass123')
    })
  })

  describe('2FA setup', () => {
    it('twoFactorSetup should call two-factor service', async () => {
      const user = buildUser({ id: 'user-1' })
      twoFactorService.setupTwoFactor.mockResolvedValue({
        qrCodeDataUrl: 'data:url',
        manualCode: 'secret',
      })
      const req = mockDeep<Request>()
      Object.assign(req, { user })

      const result = await controller.twoFactorSetup(req as never)

      expect(twoFactorService.setupTwoFactor).toHaveBeenCalledWith('user-1')
      expect(result).toEqual({ qrCodeDataUrl: 'data:url', manualCode: 'secret' })
    })

    it('twoFactorEnable should call two-factor service', async () => {
      const user = buildUser({ id: 'user-1' })
      const req = mockDeep<Request>()
      Object.assign(req, { user })

      await controller.twoFactorEnable(req as never, { code: '123456' })

      expect(twoFactorService.enableTwoFactor).toHaveBeenCalledWith('user-1', '123456')
    })

    it('twoFactorDisable should call two-factor service', async () => {
      const user = buildUser({ id: 'user-1' })
      const req = mockDeep<Request>()
      Object.assign(req, { user })

      await controller.twoFactorDisable(req as never, { code: '654321' })

      expect(twoFactorService.disableTwoFactor).toHaveBeenCalledWith('user-1', '654321')
    })

    it('twoFactorVerifyLogin should create session and set cookies', async () => {
      const user = buildUser({ id: 'user-1' })
      twoFactorService.verifyLoginCode.mockResolvedValue(user as never)
      authService.completeTwoFactorLogin.mockResolvedValue({
        access_token: 'at',
        refresh_token: 'rt',
      })
      const res = createResponse()
      const req = { cookies: {} } as Request

      await controller.twoFactorVerifyLogin({ pendingToken: 'pending', code: '000000' }, req, res)

      expect(twoFactorService.verifyLoginCode).toHaveBeenCalledWith('pending', '000000')
      expect(authService.completeTwoFactorLogin).toHaveBeenCalledWith(user.id)
      expect(tokenService.setAuthCookies).toHaveBeenCalledWith(res, 'at', 'rt')
    })
  })
})
