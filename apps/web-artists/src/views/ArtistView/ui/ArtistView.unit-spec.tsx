import { WorkspaceThemeProvider } from '@shared/theme/WorkspaceThemeProvider'
import {
  fireEvent,
  render as renderWithProviders,
  screen,
  within,
} from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { ArtistView } from './ArtistView'

vi.mock('@tanstack/react-router', () => ({
  useLocation: ({
    select,
  }: {
    select: (location: { pathname: string }) => string
  }) => select({ pathname: '/' }),
  Link: ({ to, children, ...rest }: { to: string; children: ReactNode }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}))

const render = (ui: ReactNode) =>
  renderWithProviders(<WorkspaceThemeProvider>{ui}</WorkspaceThemeProvider>)

// The replica draws real `Waveform`s, which measure themselves; jsdom has no ResizeObserver.
vi.stubGlobal(
  'ResizeObserver',
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
)

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
    const finale = within(
      screen.getByRole('region', {
        name: 'Your next release starts here.',
      }),
    )
    for (const name of ['Create your release', 'Start a new release']) {
      expect(finale.getByRole('link', { name })).toHaveAttribute(
        'href',
        '/registration',
      )
    }
    expect(finale.getByRole('link', { name: 'Log in' })).toHaveAttribute(
      'href',
      '/login',
    )
  })

  it('says plainly that store delivery is not connected', () => {
    render(<ArtistView />)

    expect(
      screen.getByText(/External store delivery is not connected yet\./),
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

  it('lets readers follow the release journey without scroll animation', () => {
    render(<ArtistView />)
    const journey = within(
      screen.getByRole('region', { name: 'From master to premiere.' }),
    )

    fireEvent.click(journey.getByRole('tab', { name: /Review/ }))
    expect(journey.getByRole('tab', { name: /Review/ })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(
      journey.getByText('Submitted for Bitrate review'),
    ).toBeInTheDocument()

    fireEvent.click(journey.getByRole('tab', { name: /Live/ }))
    expect(
      journey.getByRole('link', { name: 'Start your release' }),
    ).toHaveAttribute('href', '/registration')
  })

  it('switches interactive studio preview tabs in the hero stage', () => {
    render(<ArtistView />)

    expect(
      screen.getByText('night-signal-master-24bit.wav · 42.8 MB'),
    ).toBeInTheDocument()
    expect(screen.queryByText('Danger zone')).not.toBeInTheDocument()

    const credits = screen.getByRole('button', {
      name: 'Credits & splits',
    })
    fireEvent.click(credits)
    const details = screen.getByRole('dialog', { name: 'Credits & splits' })
    expect(within(details).getByText('Kite Harbor')).toBeInTheDocument()
    fireEvent.keyDown(details, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(credits).toHaveFocus()

    fireEvent.click(screen.getByRole('tab', { name: /02.*Dashboard/i }))
    expect(screen.getByText('Your catalogue')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: /03.*Analytics/i }))
    expect(screen.getByText('14,820')).toBeInTheDocument()
  })

  it('changes the listening preview and track ranking with the selected period', () => {
    render(<ArtistView />)
    const preview = within(
      screen.getByRole('region', {
        name: 'Interactive listening analytics preview',
      }),
    )
    expect(preview.getByText('Demo data')).toBeInTheDocument()
    expect(preview.getAllByRole('listitem')[0]).toHaveTextContent(
      'Night Signal',
    )
    expect(
      preview.getByRole('heading', { name: 'Night Signal' }),
    ).toBeInTheDocument()
    fireEvent.click(preview.getByRole('button', { name: '7 days' }))
    expect(preview.getAllByRole('listitem')[0]).toHaveTextContent(
      'Echoes in Motion',
    )
    expect(
      preview.getByRole('heading', { name: 'Echoes in Motion' }),
    ).toBeInTheDocument()
    fireEvent.click(preview.getByRole('button', { name: '90 days' }))
    expect(preview.getAllByRole('listitem')[0]).toHaveTextContent('Afterglow')
    expect(
      preview.getByRole('heading', { name: 'Afterglow' }),
    ).toBeInTheDocument()
    const chart = preview.getByRole('slider')
    fireEvent.keyDown(chart, { key: 'Home' })
    expect(chart).toHaveAttribute('aria-valuenow', '0')
    fireEvent.keyDown(chart, { key: 'ArrowRight' })
    expect(chart).toHaveAttribute('aria-valuenow', '1')
  })

  it('shows the selected contributor’s recording and composition shares', () => {
    render(<ArtistView />)
    const credits = within(
      screen.getByRole('region', { name: /Made together/ }),
    )
    const kite = credits.getByRole('button', { name: /Kite Harbor/ })
    fireEvent.click(kite)
    expect(kite).toHaveAttribute('aria-pressed', 'true')
    expect(credits.getAllByText('25', { selector: '.sr-only' })).toHaveLength(2)
    fireEvent.click(credits.getByRole('button', { name: /Mira Sol/ }))
    expect(credits.getAllByText('75', { selector: '.sr-only' })).toHaveLength(2)
  })
})
