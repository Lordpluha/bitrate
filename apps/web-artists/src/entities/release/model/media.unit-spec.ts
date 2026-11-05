import { describe, expect, it } from 'vitest'
import { trackCoverUrl } from './media'

describe('trackCoverUrl', () => {
  it('keeps the path of a cover copied from a release', () => {
    expect(trackCoverUrl('/static/releases/covers/a.jpg')).toMatch(
      /\/static\/releases\/covers\/a\.jpg$/,
    )
  })

  it('places a bare file name in the public track covers folder', () => {
    expect(trackCoverUrl('my cover.jpg')).toMatch(
      /\/static\/tracks\/covers\/my%20cover\.jpg$/,
    )
  })

  it('leaves an absolute URL alone', () => {
    expect(trackCoverUrl('https://cdn.example/a.jpg')).toBe(
      'https://cdn.example/a.jpg',
    )
  })
})
