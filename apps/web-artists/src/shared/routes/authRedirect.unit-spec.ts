import { describe, expect, it } from 'vitest'
import { getLoginDestination } from './authRedirect'

describe('login destination', () => {
  it('preserves a dashboard destination including search and hash', () => {
    expect(getLoginDestination('/dashboard/music?draft=1#details')).toBe(
      '/dashboard/music?draft=1#details',
    )
  })

  it.each([
    undefined,
    42,
    'https://example.com',
    '//example.com',
    '/dashboard\\example.com',
    '/dashboard/../login',
    '/login',
    '/dashboard-other',
    '/dashboard/%5cexample.com',
    '/dashboard\n/evil',
    '/dashboard/%',
  ])('falls back to the dashboard for unsafe destination %s', (destination) => {
    expect(getLoginDestination(destination)).toBe('/dashboard')
  })
})
