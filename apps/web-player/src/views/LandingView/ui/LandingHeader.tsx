'use client'

import { cn, Popover, PopoverContent, PopoverTrigger } from '@bitrate/ui-react'
import { useSettingsStore } from '@entities/Settings'
import { Theme, Themes, Z_INDEX_CLASS } from '@shared/constants'
import { useTheme } from '@shared/contexts'
import { localeLabels, useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes'
import { menuItemClassName, menuPanelClassName } from '@shared/ui'
import { Check, ChevronDown, Globe } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { lc } from '../lib/styles/lc'
import { GITHUB_REPO_URL } from '../model/links'
import type { LandingKey } from '../model/messages/en'
import { useLandingCopy } from '../model/useLandingCopy'

const NAV: readonly { scene: string; label: LandingKey }[] = [
  { scene: 'hero', label: 'chrome.web_player' },
  { scene: 'library', label: 'chrome.your_library' },
  { scene: 'rules', label: 'chrome.features' },
]
const THEME_LABEL: Record<Theme, LandingKey> = {
  [Theme.dark]: 'chrome.dark',
  [Theme.light]: 'chrome.light',
  [Theme.dim]: 'chrome.dim',
}

type LandingHeaderProps = {
  /** The visitor has a session: the header button opens the player instead of sign-up. */
  signedIn: boolean
}

/** Landing header: brand, scene links, GitHub, language and theme switches and the way into the player. */
export const LandingHeader = ({ signedIn }: LandingHeaderProps) => {
  const c = useLandingCopy()
  const { locale } = useI18n()
  const setSetting = useSettingsStore((s) => s.setSetting)
  const { theme, setTheme } = useTheme()
  const [langOpen, setLangOpen] = useState(false)
  const currentLabel =
    localeLabels.find(({ value }) => value === locale)?.label ?? locale
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
        <span className={lc('brand-name')}>Bitrate</span>
      </a>
      <nav aria-label={c('chrome.nav')} className={lc('nav')}>
        {NAV.map(({ scene, label }) => (
          <a href={ROUTES.landingScene(scene)} key={scene}>
            {c(label)}
          </a>
        ))}
      </nav>
      <div className={lc('top-actions')}>
        <a
          className={lc('top-icon top-github')}
          href={GITHUB_REPO_URL}
          rel="noopener noreferrer"
          target="_blank"
        >
          <svg aria-hidden="true" className={lc('i')}>
            <use href="#i-github" />
          </svg>
          <span className="sr-only">{c('chrome.github_aria')}</span>
        </a>
        <Popover onOpenChange={setLangOpen} open={langOpen}>
          <PopoverTrigger
            aria-label={c('chrome.language_current', {
              language: currentLabel,
            })}
            className={lc('top-lang')}
          >
            <Globe aria-hidden="true" className={lc('top-lang-globe')} />
            <span>{locale.toUpperCase()}</span>
            <ChevronDown aria-hidden="true" className={lc('top-lang-chev')} />
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className={cn(Z_INDEX_CLASS.popover, 'w-48', menuPanelClassName)}
            positionerClassName={Z_INDEX_CLASS.popover}
            sideOffset={8}
          >
            <div aria-label={c('chrome.language')} role="menu">
              {localeLabels.map(({ label, value }) => (
                <button
                  aria-checked={value === locale}
                  className={cn(
                    menuItemClassName,
                    'justify-between',
                    value === locale && 'text-accent [&_svg]:text-accent',
                  )}
                  key={value}
                  lang={value}
                  onClick={() => {
                    setSetting('language', value)
                    setLangOpen(false)
                  }}
                  role="menuitemradio"
                  type="button"
                >
                  {label}
                  {value === locale ? (
                    <Check aria-hidden="true" size={16} />
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {value.toUpperCase()}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <fieldset aria-label={c('chrome.theme')} className={lc('themes')}>
          {Themes.map((t) => (
            <button
              aria-pressed={theme === t}
              data-theme={t}
              key={t}
              onClick={() => setTheme(t)}
              type="button"
            >
              {c(THEME_LABEL[t])}
            </button>
          ))}
        </fieldset>
        <Link
          className={lc('btn btn-primary btn-sm top-cta')}
          data-funnel="header"
          href={signedIn ? ROUTES.main : ROUTES.auth.registration}
        >
          {c(signedIn ? 'chrome.open_player' : 'chrome.start_listening')}
          <svg aria-hidden="true" className={lc('i')}>
            <use href="#i-arrow" />
          </svg>
        </Link>
      </div>
    </header>
  )
}
