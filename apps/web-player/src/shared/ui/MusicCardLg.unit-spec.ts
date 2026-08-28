import { describe, expect, it } from 'vitest'
import { fallbackArtistImage, fallbackPlaylistCover } from '@/shared/constants'
import { resolveMusicCardImage } from './MusicCardLg'

describe('resolveMusicCardImage', () => {
  it('keeps an already normalized media URL unchanged', () => {
    const imageUrl = '/api-media/static/tracks/covers/cover.jpg'

    expect(resolveMusicCardImage(imageUrl, false)).toBe(imageUrl)
  })

  it('uses an entity-appropriate fallback', () => {
    expect(resolveMusicCardImage(undefined, true)).toBe(fallbackArtistImage)
    expect(resolveMusicCardImage(undefined, false)).toBe(fallbackPlaylistCover)
  })
})
