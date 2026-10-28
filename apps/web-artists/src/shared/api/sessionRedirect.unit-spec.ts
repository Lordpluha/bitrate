import { describe, expect, it } from 'vitest'
import { redirectsToLoginOnExpiry } from './sessionRedirect'

describe('redirectsToLoginOnExpiry', () => {
  it.each([
    '/dashboard',
    '/dashboard/music',
    '/dashboard/music/abc?step=draft',
  ])('sends an expired session on %s to the login page', (path) => {
    expect(redirectsToLoginOnExpiry(path)).toBe(true)
  })

  it.each([
    '/',
    '/login',
    '/registration',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/legal/terms',
    '/no-such-page',
    '/dashboards-are-not-the-workspace',
  ])('leaves a guest on the public page %s', (path) => {
    expect(redirectsToLoginOnExpiry(path)).toBe(false)
  })
})
