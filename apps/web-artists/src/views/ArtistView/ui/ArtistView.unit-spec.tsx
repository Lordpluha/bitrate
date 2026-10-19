import { render, screen, within } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { ArtistView } from './ArtistView'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children, ...rest }: { to: string; children: ReactNode }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}))

describe('ArtistView', () => {
  it('leads to sign-up and log-in', () => {
    render(<ArtistView />)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Plan, prepare and track your releases.',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Create an account' }),
    ).toHaveAttribute('href', '/registration')
    const account = screen.getByRole('navigation', { name: 'Account' })
    expect(
      within(account).getByRole('link', { name: 'Sign up' }),
    ).toHaveAttribute('href', '/registration')
    expect(
      within(account).getByRole('link', { name: 'Log in' }),
    ).toHaveAttribute('href', '/login')
  })

  it('says plainly that store delivery is not connected', () => {
    render(<ArtistView />)

    expect(
      screen.getByRole('heading', { level: 2, name: 'Distribution plan' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Delivery to external stores is not connected yet\./),
    ).toBeInTheDocument()
  })

  it('carries none of the Spotify for Artists copy it used to reproduce', () => {
    const { container } = render(<ArtistView />)

    expect(container).not.toHaveTextContent(
      /Spotify|Campaign Kit|Marquee|Discovery Mode|Countdown Pages|Loud & Clear|Super Listeners/i,
    )
    expect(container.querySelector('video, iframe')).toBeNull()
  })

  it('links every legal document from the footer', () => {
    render(<ArtistView />)
    const legal = screen.getByRole('navigation', { name: 'Legal' })

    expect(
      within(legal).getByRole('link', { name: 'Artist Agreement' }),
    ).toHaveAttribute('href', '/legal/artist-agreement')
    expect(within(legal).getAllByRole('link')).toHaveLength(5)
  })
})
