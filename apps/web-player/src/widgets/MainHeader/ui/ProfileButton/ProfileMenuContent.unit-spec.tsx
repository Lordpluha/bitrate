import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ROUTES } from '@/shared/routes'
import { ProfileMenuContent } from './ProfileMenuContent'

describe('ProfileMenuContent', () => {
  it('only exposes existing, unique internal destinations', () => {
    render(<ProfileMenuContent isLogoutPending={false} onLogout={vi.fn()} />)

    expect(
      screen.getAllByRole('link').map((link) => ({
        href: link.getAttribute('href'),
        label: link.textContent,
      })),
    ).toEqual([
      { href: ROUTES.profile, label: 'Profile' },
      { href: ROUTES.recents, label: 'Recents' },
      { href: ROUTES.settings, label: 'Settings' },
    ])
    expect(screen.queryByText('Support')).not.toBeInTheDocument()
    expect(screen.queryByText('Download')).not.toBeInTheDocument()
    expect(screen.queryByText('Account')).not.toBeInTheDocument()
  })
})
