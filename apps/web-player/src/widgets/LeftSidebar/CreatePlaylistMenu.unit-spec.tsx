import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ROUTES } from '@/shared/routes'
import { CreatePlaylistMenu } from './CreatePlaylistMenu'

const navigation = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: navigation.push }),
}))

describe('CreatePlaylistMenu', () => {
  it('opens the new playlist form, the one way playlists are created', async () => {
    const user = userEvent.setup()
    render(<CreatePlaylistMenu />)

    const trigger = screen.getByRole('button', { name: 'Create' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    await user.click(screen.getByRole('button', { name: /Playlist/ }))
    expect(navigation.push).toHaveBeenCalledWith(ROUTES.createPlaylist)
    await waitFor(() =>
      expect(trigger).toHaveAttribute('aria-expanded', 'false'),
    )
  })
})
