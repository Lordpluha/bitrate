import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LikeTrackButton } from './LikeTrackButton'

const like = vi.hoisted(() => ({
  isLiked: false,
  toggleLike: vi.fn(),
}))
vi.mock('@entities/Track/api/client', () => ({
  useTrackLike: () => ({
    isLiked: like.isLiked,
    isPending: false,
    toggleLike: like.toggleLike,
  }),
}))

describe('LikeTrackButton', () => {
  beforeEach(() => {
    like.toggleLike.mockClear()
  })

  it('shows the liked state the server reports, not one of its own', () => {
    like.isLiked = true
    render(<LikeTrackButton trackId="t1" trackTitle="Afterglow" />)

    const button = screen.getByRole('button', {
      name: 'Remove Afterglow from Liked Songs',
    })
    expect(button).toHaveAttribute('aria-pressed', 'true')
  })

  it('toggles the like through the shared hook', async () => {
    like.isLiked = false
    render(<LikeTrackButton trackId="t1" trackTitle="Afterglow" />)

    await userEvent.click(
      screen.getByRole('button', { name: 'Save Afterglow to Liked Songs' }),
    )

    expect(like.toggleLike).toHaveBeenCalledOnce()
  })
})
