import { clientFetchClient } from '@shared/api/client'
import { I18nProvider } from '@shared/i18n'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SceneDevices } from '../scenes/SceneDevices'
import { SceneLibrary } from '../scenes/SceneLibrary'
import { SceneLoop } from '../scenes/SceneLoop'
import { SceneRules } from '../scenes/SceneRules'
import { SceneSocial } from '../scenes/SceneSocial'
import { LandingDemoProvider } from './LandingDemoProvider'

/** Outside the App Router the navigation hooks have no context; the landing sits at `/`. */
vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/navigation')>()),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

/** A browser API jsdom lacks, as a constructor that observes nothing. */
class Unobserved {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

const renderScenes = () =>
  render(
    <I18nProvider locale="en">
      <LandingDemoProvider>
        <SceneLoop />
        <SceneRules />
        <SceneLibrary />
        <SceneDevices />
        <SceneSocial />
      </LandingDemoProvider>
    </I18nProvider>,
  )

/** Lets effects, the demo player state and every query settle. */
const settle = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0))
  })

/**
 * Stubbed before any module loads: the API client keeps the `fetch` it finds at import, so
 * the spy sees every request the real hooks would send.
 */
const fetchSpy = vi.hoisted(() => {
  const spy = vi.fn(async () => new Response('{}', { status: 200 }))
  vi.stubGlobal('fetch', spy)
  vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://api.test')
  return spy
})

describe('landing demo blocks', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', Unobserved)
    vi.stubGlobal('ResizeObserver', Unobserved)
    vi.stubGlobal('matchMedia', () => ({
      addEventListener: () => undefined,
      matches: false,
      removeEventListener: () => undefined,
    }))
  })

  afterEach(() => {
    fetchSpy.mockClear()
  })

  it('would notice a request from the API client', async () => {
    await clientFetchClient.GET('/api/v1/auth/me')
    expect(fetchSpy).toHaveBeenCalled()
  })

  it('renders the player blocks from demo data without a single request', async () => {
    renderScenes()
    await settle()

    expect(screen.getAllByText('Night Signal').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Maya Rivers').length).toBeGreaterThan(0)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('keeps a like and a play local to the page', async () => {
    renderScenes()
    await settle()

    const liked = within(screen.getByRole('region', { name: 'Liked Songs' }))
    const like = liked.getAllByRole('button', { name: /Liked Songs/ })[0]
    if (!like) throw new Error('no like button in Liked Songs')
    const wasLiked = like.getAttribute('aria-pressed')
    fireEvent.click(like)
    await settle()
    expect(like.getAttribute('aria-pressed')).not.toBe(wasLiked)

    fireEvent.click(
      liked.getAllByRole('button', { name: /^Play / })[0] as Element,
    )
    await settle()

    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
