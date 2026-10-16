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

  it('never sends a guest into the player, which needs an account', () => {
    const { container } = render(
      withQuery(
        <>
          <SceneSignal signedIn={false} />
          <SceneStart signedIn={false} />
        </>,
      ),
    )
    expect(container.querySelectorAll('a[href^="/main"]')).toHaveLength(0)
    expect(
      screen.queryByRole('link', { name: /Open web player/, hidden: true }),
    ).not.toBeInTheDocument()
  })

  it('offers a guest registration and login in the hero and the final scene', () => {
    render(
      withQuery(
        <>
          <SceneSignal signedIn={false} />
          <SceneStart signedIn={false} />
        </>,
      ),
    )
    for (const name of [
      'Your music, already where you are',
      'Pick up where the last track left off',
    ]) {
      const scene = within(screen.getByRole('region', { name }))
      expect(
        scene.getAllByRole('link', { name: /Create account/ })[0],
      ).toHaveAttribute('href', '/auth/registration')
      expect(scene.getAllByRole('link', { name: /Log in/ })[0]).toHaveAttribute(
        'href',
        '/auth/login',
      )
    }
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
