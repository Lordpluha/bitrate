import { describe, expect, it } from 'vitest'
import { decodeRouteSegment, isEntityIdSegment } from './profileSegment'
import { ROUTES } from './routes'

describe('isEntityIdSegment', () => {
  it('recognises a UUIDv7 id in either case', () => {
    expect(isEntityIdSegment('0199a3b2-7c4d-7e8f-9a0b-1c2d3e4f5a6b')).toBe(true)
    expect(isEntityIdSegment('0199A3B2-7C4D-7E8F-9A0B-1C2D3E4F5A6B')).toBe(true)
  })

  it('treats anything else as a username', () => {
    expect(isEntityIdSegment('luma_vale')).toBe(false)
    expect(isEntityIdSegment('Luma Vale')).toBe(false)
    expect(isEntityIdSegment('0199a3b2-7c4d-7e8f-9a0b')).toBe(false)
  })
})

describe('decodeRouteSegment', () => {
  it('decodes an encoded username', () => {
    expect(decodeRouteSegment('Luma%20Vale')).toBe('Luma Vale')
  })

  it('keeps a malformed escape as written', () => {
    expect(decodeRouteSegment('100%')).toBe('100%')
  })
})

describe('profile routes', () => {
  it('builds profile paths from usernames, encoding reserved characters', () => {
    expect(ROUTES.artist('luma_vale')).toBe('/main/artist/luma_vale')
    expect(ROUTES.user('Jonah Pike')).toBe('/main/user/Jonah%20Pike')
    expect(ROUTES.user('a/b?c')).toBe('/main/user/a%2Fb%3Fc')
  })

  it('round-trips a username through the path and decodeRouteSegment', () => {
    const segment = ROUTES.artist('Mira Sol & co').split('/').at(-1) ?? ''

    expect(decodeRouteSegment(segment)).toBe('Mira Sol & co')
  })
})
