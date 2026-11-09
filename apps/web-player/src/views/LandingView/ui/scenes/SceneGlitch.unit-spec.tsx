import { I18nProvider, type Locale } from '@shared/i18n'
import { render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LandingDemoProvider } from '../demo/LandingDemoProvider'
import { SceneDevices } from './SceneDevices'
import { SceneSignal } from './SceneSignal'

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

const glitchTexts = (locale: Locale) => {
  const { container, unmount } = render(
    <I18nProvider locale={locale}>
      <SceneSignal signedIn={false} stats={null} />
      <LandingDemoProvider>
        <SceneDevices />
      </LandingDemoProvider>
    </I18nProvider>,
  )
  const pairs = [
    ...container.querySelectorAll<HTMLElement>('.glitch[data-text]'),
  ].map((el) => [el.dataset.text, el.textContent])
  unmount()
  return pairs
}

describe('landing glitch labels', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    vi.stubGlobal('IntersectionObserver', Unobserved)
    vi.stubGlobal('ResizeObserver', Unobserved)
    vi.stubGlobal('matchMedia', () => ({
      addEventListener: () => undefined,
      matches: false,
      removeEventListener: () => undefined,
    }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it.each<Locale>(['en', 'uk', 'pl'])(
    'ghost the localised label in %s',
    (locale) => {
      const pairs = glitchTexts(locale)
      expect(pairs.length).toBeGreaterThan(0)
      for (const [ghost, text] of pairs) expect(ghost).toBe(text)
    },
  )
})
