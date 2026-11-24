import { API_BASE_URL } from './config'
import { resolveMediaUrl } from './media-url'

describe('resolveMediaUrl', () => {
  it('returns null for a missing value so the caller shows its placeholder', () => {
    expect(resolveMediaUrl(null, 'tracks/covers')).toBeNull()
    expect(resolveMediaUrl('  ', 'tracks/covers')).toBeNull()
  })

  it('keeps an absolute URL', () => {
    expect(resolveMediaUrl('https://cdn.test/a.jpg', 'tracks/covers')).toBe('https://cdn.test/a.jpg')
  })

  it('prefixes an API static path with the API origin', () => {
    expect(resolveMediaUrl('/static/albums/covers/a.jpg', 'albums/covers')).toBe(
      `${API_BASE_URL}/static/albums/covers/a.jpg`,
    )
  })

  it('places a bare file name in its static folder', () => {
    expect(resolveMediaUrl('my cover.jpg', 'playlists/covers')).toBe(
      `${API_BASE_URL}/static/playlists/covers/my%20cover.jpg`,
    )
  })

  it('drops a web-only local path the app cannot load', () => {
    expect(resolveMediaUrl('/images/fallback.png', 'tracks/covers')).toBeNull()
  })
})
