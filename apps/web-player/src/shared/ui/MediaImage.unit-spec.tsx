import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { getMediaFallbackUrl } from '@/shared/utils/mediaUrl'
import { MediaImage } from './MediaImage'

/** next/image may resolve the source against the page origin; compare the path only. */
const srcPath = (alt: string) =>
  new URL(
    screen.getByAltText(alt).getAttribute('src') ?? '',
    'http://localhost',
  ).pathname

describe('MediaImage', () => {
  it('shows the cover while it loads', () => {
    render(
      <MediaImage
        alt="Afterglow"
        fallback="track"
        height={40}
        src="/covers/afterglow.webp"
        unoptimized
        width={40}
      />,
    )

    expect(srcPath('Afterglow')).toBe('/covers/afterglow.webp')
  })

  it('swaps a cover that fails to load for the placeholder of its kind', () => {
    render(
      <MediaImage
        alt="Afterglow"
        fallback="album"
        height={40}
        src="/covers/broken.webp"
        unoptimized
        width={40}
      />,
    )

    fireEvent.error(screen.getByAltText('Afterglow'))

    expect(srcPath('Afterglow')).toBe(getMediaFallbackUrl('album'))
  })

  it('uses the placeholder for an empty source', () => {
    render(
      <MediaImage
        alt="Night Drive"
        fallback="playlist"
        height={40}
        src=""
        unoptimized
        width={40}
      />,
    )

    expect(srcPath('Night Drive')).toBe(getMediaFallbackUrl('playlist'))
  })

  it('tries a new source again after an earlier one failed', () => {
    const { rerender } = render(
      <MediaImage
        alt="Cover"
        fallback="track"
        height={40}
        src="/covers/broken.webp"
        unoptimized
        width={40}
      />,
    )
    fireEvent.error(screen.getByAltText('Cover'))

    rerender(
      <MediaImage
        alt="Cover"
        fallback="track"
        height={40}
        src="/covers/next.webp"
        unoptimized
        width={40}
      />,
    )

    expect(srcPath('Cover')).toBe('/covers/next.webp')
  })
})
