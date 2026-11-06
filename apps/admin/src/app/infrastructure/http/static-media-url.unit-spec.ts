import { describe, expect, it } from 'vitest'
import { API_BASE_URL } from './api.config'
import { toStaticMediaUrl } from './static-media-url'

describe('toStaticMediaUrl', () => {
  it('joins a bare file name under its own bucket, escaped', () => {
    expect(toStaticMediaUrl('my cover.png', 'albums/covers')).toBe(
      `${API_BASE_URL}/static/albums/covers/${encodeURIComponent('my cover.png')}`,
    )
  })

  it('keeps a stored /static path as-is instead of nesting it under the bucket', () => {
    const cover = '/static/releases/covers/25af8977-5d97-45c7-9869-13927d03984d.jpg'

    expect(toStaticMediaUrl(cover, 'albums/covers')).toBe(`${API_BASE_URL}${cover}`)
    expect(toStaticMediaUrl(cover, 'tracks/covers')).toBe(`${API_BASE_URL}${cover}`)
  })

  it('passes an absolute URL through', () => {
    expect(toStaticMediaUrl('https://cdn.example.com/a.jpg', 'tracks/covers')).toBe(
      'https://cdn.example.com/a.jpg',
    )
  })

  it.each([null, undefined, '', '   '])('maps %j to null', (value) => {
    expect(toStaticMediaUrl(value, 'albums/covers')).toBeNull()
  })
})
