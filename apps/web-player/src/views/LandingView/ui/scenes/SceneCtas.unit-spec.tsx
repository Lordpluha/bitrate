import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SceneSignal } from './SceneSignal'
import { SceneStart } from './SceneStart'

const withQuery = (ui: ReactNode) => (
  <QueryClientProvider
    client={
      new QueryClient({ defaultOptions: { queries: { enabled: false } } })
    }
  >
    {ui}
  </QueryClientProvider>
)

describe('landing calls to action', () => {
  beforeEach(() => {
    /* jsdom has no matchMedia; the status pill reads prefers-reduced-motion */
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
  })

  it('sends a guest to the player, registration and login', () => {
    render(
      withQuery(
        <>
          <SceneSignal signedIn={false} />
          <SceneStart signedIn={false} />
        </>,
      ),
    )
    const hero = within(
      screen.getByRole('region', { name: 'Your music, already where you are' }),
    )
    expect(hero.getByRole('link', { name: /Open web player/ })).toHaveAttribute(
      'href',
      '/main',
    )
    expect(hero.getByRole('link', { name: 'Create account' })).toHaveAttribute(
      'href',
      '/auth/registration',
    )
    const start = within(
      screen.getByRole('region', {
        name: 'Pick up where the last track left off',
      }),
    )
    expect(start.getByRole('link', { name: 'Log in' })).toHaveAttribute(
      'href',
      '/auth/login',
    )
    expect(start.getByRole('link', { name: 'Create account' })).toHaveAttribute(
      'href',
      '/auth/registration',
    )
  })

  it('shows a signed-in visitor only the way into the player', () => {
    render(
      withQuery(
        <>
          <SceneSignal signedIn />
          <SceneStart signedIn />
        </>,
      ),
    )
    expect(
      screen.getAllByRole('link', { name: /Open web player/ })[0],
    ).toHaveAttribute('href', '/main')
    expect(
      screen.queryByRole('link', { name: 'Create account' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Log in' }),
    ).not.toBeInTheDocument()
  })
})
