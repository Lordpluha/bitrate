'use client'

import { Theme, Themes } from '@shared/constants'
import { useTheme } from '@shared/contexts'
import { ROUTES } from '@shared/routes'
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

/** Landing header: brand, scene links, the app theme switch and the demo "Play signal" sound toggle. */
export const LandingHeader = () => {
  const c = useLandingCopy()
  const { theme, setTheme } = useTheme()
  return (
    <header className="top">
      <a
        aria-label={c('chrome.home')}
        className="brand"
        href={ROUTES.landingScene('hero')}
      >
        <svg aria-hidden="true" className="mark" viewBox="371 117 795 775">
          <use fill="url(#bm)" href="#bitrate-logo" />
        </svg>
        Bitrate
      </a>
      <nav aria-label={c('chrome.nav')} className="nav">
        {NAV.map(({ scene, label }) => (
          <a href={ROUTES.landingScene(scene)} key={scene}>
            {c(label)}
          </a>
        ))}
      </nav>
      <div className="top-actions">
        <fieldset aria-label={c('chrome.theme')} className="themes">
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
        <button
          aria-pressed="false"
          className="btn btn-ghost btn-sm"
          data-landing-sound=""
          type="button"
        >
          <span aria-hidden="true" className="sound-bars">
            <i />
            <i />
            <i />
          </span>
          <span className="label">{c('chrome.play_signal')}</span>
        </button>
      </div>
    </header>
  )
}
