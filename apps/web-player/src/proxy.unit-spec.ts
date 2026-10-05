import { describe, expect, it } from 'vitest'
import { isPublicRoute } from './proxy'

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
