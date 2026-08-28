import { describe, expect, it } from 'vitest'
import { resolveSiteUrl } from './site'

describe('resolveSiteUrl', () => {
  it('normalizes a configured public origin', () => {
    expect(resolveSiteUrl('https://player.example.com/', 'production')).toBe(
      'https://player.example.com',
    )
  })

  it('fails instead of publishing localhost metadata in production', () => {
    expect(() => resolveSiteUrl(undefined, 'production')).toThrow(
      'NEXT_PUBLIC_SITE_URL is required',
    )
    expect(() => resolveSiteUrl('http://localhost:3001', 'production')).toThrow(
      'must use HTTPS',
    )
  })

  it('retains the local fallback outside production', () => {
    expect(resolveSiteUrl(undefined, 'development')).toBe(
      'http://localhost:3001',
    )
  })
})
