import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'
import { isPublicRoute, proxy } from './proxy'

/** A request for a protected player page carrying the given cookies. */
const protectedRequest = (cookies: Record<string, string>) => {
  const request = new NextRequest('https://bitrate.me/main')
  for (const [name, value] of Object.entries(cookies))
    request.cookies.set(name, value)
  return request
}

describe('proxy', () => {
  it.each([
    ['an access token', { user_access_token: 'at' }],
    ['only a refresh token', { user_refresh_token: 'rt' }],
  ])('lets a player session with %s through', (_label, cookies) => {
    expect(proxy(protectedRequest(cookies)).headers.get('location')).toBeNull()
  })

  /** Every session shares the cookie domain; an admin or artist sign-in is not a player one. */
  it.each([
    ['an admin', { staff_access_token: 'at', staff_refresh_token: 'rt' }],
    ['an artist', { artist_access_token: 'at' }],
    ['a pre-split', { access_token: 'at', refresh_token: 'rt' }],
  ])('sends a visitor with only %s session to login', (_label, cookies) => {
    const location = proxy(protectedRequest(cookies)).headers.get('location')

    expect(location).toBe('https://bitrate.me/auth/login')
  })
})

describe('isPublicRoute', () => {
  it.each([
    '/',
    '/auth/login',
    '/auth/login/2fa',
    '/auth/registration',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/verify-email',
    '/login',
    '/login/2fa',
    '/offline',
    '/legal/terms',
    '/legal/privacy',
    '/legal/community',
    '/legal/complaints',
    '/legal/copyright',
  ])('allows anonymous access to %s', (pathname) => {
    expect(isPublicRoute(pathname)).toBe(true)
  })

  it.each(['/main', '/main/library', '/verify-email/other', '/legal/unknown'])(
    'keeps %s protected',
    (pathname) => {
      expect(isPublicRoute(pathname)).toBe(false)
    },
  )
})
