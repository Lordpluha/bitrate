import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { BurgerMenu } from './BurgerMenu'

vi.mock('@/shared/hooks/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isLogoutPending: false,
    logout: vi.fn(),
    user: { avatar: null, username: 'Listener' },
  }),
}))

describe('BurgerMenu', () => {
  it('removes a closed drawer from interaction and restores trigger focus', async () => {
    const user = userEvent.setup()
    render(<BurgerMenu />)

    const trigger = screen.getByRole('button', { name: 'Open menu' })
    const panel = screen.getByLabelText('Main navigation', {
      selector: '[role="dialog"]',
    })

    expect(panel).toHaveAttribute('inert')
    expect(panel).toHaveClass('invisible', 'pointer-events-none')

    await user.click(trigger)

    const close = within(panel).getByRole('button', { name: 'Close menu' })
    await waitFor(() => expect(close).toHaveFocus())
    expect(panel).not.toHaveAttribute('inert')

    screen.getByRole('button', { name: 'Log out' }).focus()
    await user.tab()
    expect(close).toHaveFocus()

    await user.keyboard('{Escape}')
    await waitFor(() => expect(trigger).toHaveFocus())
    expect(panel).toHaveAttribute('inert')
  })

  it('reaches every page the island does not hold, on any screen size', async () => {
    const user = userEvent.setup()
    render(<BurgerMenu />)

    await user.click(screen.getByRole('button', { name: 'Open menu' }))
    const panel = screen.getByLabelText('Main navigation', {
      selector: '[role="dialog"]',
    })

    expect(
      within(panel)
        .getAllByRole('link')
        .map((link) => link.getAttribute('href')),
    ).toEqual([
      '/main/charts',
      '/main/activity',
      '/main/liked-songs',
      '/main/recents',
      '/main/profile',
      '/main/friends',
      '/main/stats',
      '/main/preferences',
    ])
  })
})
