import { afterEach, describe, expect, it, jest } from '@jest/globals'
import type { CookieOptions, Response } from 'express'
import { mock } from 'jest-mock-extended'
import { clearPendingTwoFactorCookie, setPendingTwoFactorCookie } from './auth-cookies'

function createResponse() {
  const response: Response = mock<Response>()
  const setCookie = jest.fn<(name: string, value: string, options?: CookieOptions) => Response>()
  response.cookie = setCookie
  return { response, setCookie }
}

describe('pending two-factor cookie scope', () => {
  const originalEnv = { ...process.env }

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it('shares the pending challenge with the artist portal on the configured domain', () => {
    process.env.NODE_ENV = 'production'
    process.env.COOKIE_DOMAIN = '.example.test'
    const { response, setCookie } = createResponse()

    setPendingTwoFactorCookie(response, 'test-pending-token')
    clearPendingTwoFactorCookie(response)

    expect(setCookie).toHaveBeenCalledWith('pending_2fa_token', 'test-pending-token', {
      domain: '.example.test',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
      maxAge: 600_000,
    })
    expect(response.clearCookie).toHaveBeenCalledWith('pending_2fa_token', {
      domain: '.example.test',
      path: '/',
    })
  })

  it('keeps localhost cookies host-only when no domain is configured', () => {
    process.env.NODE_ENV = 'development'
    delete process.env.COOKIE_DOMAIN
    const { response, setCookie } = createResponse()

    setPendingTwoFactorCookie(response, 'test-pending-token')
    clearPendingTwoFactorCookie(response)

    expect(setCookie).toHaveBeenCalledWith('pending_2fa_token', 'test-pending-token', {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
      maxAge: 600_000,
    })
    expect(response.clearCookie).toHaveBeenCalledWith('pending_2fa_token', { path: '/' })
  })
})
