import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { fallbackArtistImage, fallbackPlaylistCover } from '@/shared/constants'
import { MusicCardLg, resolveMusicCardImage } from './MusicCardLg'

describe('MusicCardLg play button', () => {
  it('starts playback without following the card link', () => {
    const onPlay = vi.fn()
    render(
      <MusicCardLg
        href="/main/album/a1"
        id="a1"
        imageUrl="/covers/a1.webp"
        name="Afterglow"
        onPlay={onPlay}
      />,
    )

    const play = screen.getByRole('button', { name: 'Play Afterglow' })
    expect(play.closest('a')).toBeNull()
    fireEvent.click(play)

    expect(onPlay).toHaveBeenCalledOnce()
    expect(screen.getByRole('link', { name: /Afterglow/ })).toHaveAttribute(
      'href',
      '/main/album/a1',
    )
  })

  it('has no play button when the card cannot play', () => {
    render(<MusicCardLg id="r1" isArtist name="Mira Sol" />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})

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
