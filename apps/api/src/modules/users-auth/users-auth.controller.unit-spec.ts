import { beforeEach, describe, expect, it } from '@jest/globals'
import { Request, Response } from 'express'
import { type DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'
import { TokenService } from '../tokens/token.service'
import { buildUser } from '../users/__tests__/fixtures/users.fixtures'
import { UsersService } from '../users/users.service'
import { UserAuthService } from './user-auth.service'
import { UsersAuthController } from './users-auth.controller'

const createResponse = (): DeepMockProxy<Response> => mockDeep<Response>()

describe('UsersAuthController', () => {
  let controller: UsersAuthController
  let authService: DeepMockProxy<UserAuthService>
  let usersService: DeepMockProxy<UsersService>
  let tokenService: DeepMockProxy<TokenService>

  beforeEach(() => {
    authService = mockDeep<UserAuthService>()
    usersService = mockDeep<UsersService>()
    tokenService = mockDeep<TokenService>()

    mockReset(authService)
    mockReset(usersService)
    mockReset(tokenService)

    controller = new UsersAuthController(authService, usersService, tokenService)
  })

  it('login should call auth service and set cookies', async () => {
    authService.loginUser.mockResolvedValue({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
    })

    const res = createResponse()

    await controller.login({ email: 'user@example.com', password: 'password123' }, res)

    expect(authService.loginUser).toHaveBeenCalledWith('user@example.com', 'password123')
    expect(tokenService.setAuthCookies).toHaveBeenCalledWith(res, 'access-token', 'refresh-token')
  })

  it('registration should call auth service', async () => {
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

  it('logout should call auth service and clear cookies', async () => {
    process.env.ACCESS_TOKEN_NAME = 'access_token'
    const user = buildUser({ id: 'user-1' })

    const req = mockDeep<Request>()
    Object.assign(req, { user, access_token: 'access-token' })

    const res = createResponse()

    await controller.logout(req, res)

    expect(authService.logout).toHaveBeenCalledWith('user-1', 'access-token')
    expect(tokenService.clearAuthCookies).toHaveBeenCalledWith(res)
  })

  it('refresh should set new access token', async () => {
    process.env.REFRESH_TOKEN_NAME = 'refresh_token'
    authService.refresh.mockResolvedValue({ access_token: 'new-access' })

    const req = mockDeep<Request>()
    Object.assign(req, { refresh_token: 'refresh-token' })
    const res = createResponse()

    await controller.refresh(req, res)

    expect(authService.refresh).toHaveBeenCalledWith('refresh-token')
    expect(tokenService.setAuthCookies).toHaveBeenCalledWith(res, 'new-access', 'refresh-token')
  })

  it('getMe should return user by id', async () => {
    const user = buildUser({ id: 'user-1' })
    usersService.findById.mockResolvedValue(user)

    const req = mockDeep<Request>()
    Object.assign(req, { user })

    const result = await controller.getMe(req)

    expect(usersService.findById).toHaveBeenCalledWith('user-1')
    expect(result).toBe(user)
  })
})
