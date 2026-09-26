import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import type { TokenService } from '@modules/tokens/token.service'
import type { Request, Response } from 'express'
import { AdminAuthController } from './admin-auth.controller'
import type { AdminAuthService } from './admin-auth.service'
import type { AdminAuthRequest } from './types'

const makeAuthServiceMock = () =>
  ({
    loginStaff: jest.fn(),
    logout: jest.fn(),
    refresh: jest.fn(),
    me: jest.fn(),
  }) as unknown as jest.Mocked<AdminAuthService>

const makeTokenServiceMock = () =>
  ({
    setAuthCookies: jest.fn(),
    clearAuthCookies: jest.fn(),
  }) as unknown as jest.Mocked<TokenService>

const makeResponse = () => ({ cookie: jest.fn(), clearCookie: jest.fn() }) as unknown as Response

describe('AdminAuthController', () => {
  let controller: AdminAuthController
  let authService: jest.Mocked<AdminAuthService>
  let tokenService: jest.Mocked<TokenService>

  beforeEach(() => {
    process.env.ACCESS_TOKEN_NAME = 'access_token'
    process.env.REFRESH_TOKEN_NAME = 'refresh_token'
    authService = makeAuthServiceMock()
    tokenService = makeTokenServiceMock()
    controller = new AdminAuthController(authService, tokenService)
  })

  it('login calls loginStaff and sets auth cookies', async () => {
    authService.loginStaff.mockResolvedValue({ access_token: 'at', refresh_token: 'rt' } as never)
    const res = makeResponse()

    await controller.login({ email: 'ops@bitrate.app', password: 'password' }, res)

    expect(authService.loginStaff).toHaveBeenCalledWith('ops@bitrate.app', 'password')
    expect(tokenService.setAuthCookies).toHaveBeenCalledWith(res, 'at', 'rt')
  })

  it('logout calls logout with staff id and clears cookies', async () => {
    const req = {
      staff: { id: 'staff-1' },
      access_token: 'at',
    } as unknown as AdminAuthRequest & Request
    const res = makeResponse()

    await controller.logout(req, res)

    expect(authService.logout).toHaveBeenCalledWith('staff-1', 'at')
    expect(tokenService.clearAuthCookies).toHaveBeenCalledWith(res)
  })

  it('getMe returns the authenticated staff member', async () => {
    authService.me.mockResolvedValue({ id: 'staff-1' } as never)

    const result = await controller.getMe({ staff: { id: 'staff-1' } } as AdminAuthRequest)

    expect(authService.me).toHaveBeenCalledWith('staff-1')
    expect(result).toEqual({ id: 'staff-1' })
  })
})
