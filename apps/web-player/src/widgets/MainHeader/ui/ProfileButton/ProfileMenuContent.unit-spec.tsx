import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ROUTES } from '@/shared/routes'
import { ProfileMenuContent } from './ProfileMenuContent'

describe('ProfileMenuContent', () => {
  it('lists the account pages once, without the pages the library panel holds', () => {
    render(<ProfileMenuContent isLogoutPending={false} onLogout={vi.fn()} />)

    expect(
      screen.getAllByRole('link').map((link) => ({
        href: link.getAttribute('href'),
        label: link.textContent,
      })),
    ).toEqual([
      { href: ROUTES.profile, label: 'Profile' },
      { href: ROUTES.friends, label: 'Friends' },
      { href: ROUTES.stats, label: 'Your listening' },
      { href: ROUTES.settings, label: 'Settings' },
    ])
    expect(screen.queryByText('Support')).not.toBeInTheDocument()
    expect(screen.queryByText('Download')).not.toBeInTheDocument()
  })

  it('leaves notifications to the bell', () => {
    render(<ProfileMenuContent isLogoutPending={false} onLogout={vi.fn()} />)

    expect(screen.queryByText('Updates')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Log out' })).toBeEnabled()
  })
})
