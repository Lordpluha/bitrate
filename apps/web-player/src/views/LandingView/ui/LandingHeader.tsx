'use client'

import { Theme, Themes } from '@shared/constants'
import { useTheme } from '@shared/contexts'
import { ROUTES } from '@shared/routes'
import { lc } from '../lib/styles/lc'
import type { LandingKey } from '../model/messages/en'
import { useLandingCopy } from '../model/useLandingCopy'

const NAV: readonly { scene: string; label: LandingKey }[] = [
  { scene: 'hero', label: 'chrome.web_player' },
  { scene: 'library', label: 'chrome.your_library' },
  { scene: 'discover', label: 'chrome.discover' },
  { scene: 'rules', label: 'chrome.features' },
]
const THEME_LABEL: Record<Theme, LandingKey> = {
  [Theme.dark]: 'chrome.dark',
  [Theme.light]: 'chrome.light',
  [Theme.dim]: 'chrome.dim',
}

/** Landing header: brand, scene links and the app theme switch. */
export const LandingHeader = () => {
  const c = useLandingCopy()
  const { theme, setTheme } = useTheme()
  return (
    <header className={lc('top')}>
      <a
        aria-label={c('chrome.home')}
        className={lc('brand')}
        href={ROUTES.landingScene('hero')}
      >
        <svg
          aria-hidden="true"
          className={lc('mark')}
          viewBox="371 117 795 775"
        >
          <use fill="url(#bm)" href="#bitrate-logo" />
        </svg>
        Bitrate
      </a>
      <nav aria-label={c('chrome.nav')} className={lc('nav')}>
        {NAV.map(({ scene, label }) => (
          <a href={ROUTES.landingScene(scene)} key={scene}>
            {c(label)}
          </a>
        ))}
      </nav>
      <div className={lc('top-actions')}>
        <fieldset aria-label={c('chrome.theme')} className={lc('themes')}>
          {Themes.map((t) => (
            <button
              aria-pressed={theme === t}
              key={t}
              onClick={() => setTheme(t)}
              type="button"
            >
              {c(THEME_LABEL[t])}
            </button>
          ))}
        </fieldset>
      </div>
    </header>
  )
}
