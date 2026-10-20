import { useColorMode, useThemeConfig } from '@docusaurus/theme-common'
import useIsBrowser from '@docusaurus/useIsBrowser'
import IconDarkMode from '@theme/Icon/DarkMode'
import IconLightMode from '@theme/Icon/LightMode'
import type { Props } from '@theme/Navbar/ColorModeToggle'
import clsx from 'clsx'
import { type ReactNode, useEffect, useState } from 'react'

import styles from './styles.module.css'

/**
 * Docusaurus knows only light and dark. Dim is dark plus `data-theme-variant="dim"` on <html>,
 * matching `:root.dim` in packages/tailwind. An attribute rather than a class, because Helmet
 * rewrites the <html> class on every navigation. The head script in docusaurus.config.ts
 * restores it from this key before first paint.
 */
export const DIM_STORAGE_KEY = 'bitrate-docs-dim'

const isDim = (): boolean => document.documentElement.dataset.themeVariant === 'dim'

type ThemeChoice = 'light' | 'dark' | 'dim'

const CHOICES: { value: ThemeChoice; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'dim', label: 'Dim' },
]

function IconDim(): ReactNode {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 4a8 8 0 0 1 0 16Z" fill="currentColor" opacity="0.45" />
    </svg>
  )
}

function ChoiceIcon({ choice }: { choice: ThemeChoice }): ReactNode {
  if (choice === 'light') return <IconLightMode aria-hidden width={16} height={16} />
  if (choice === 'dark') return <IconDarkMode aria-hidden width={16} height={16} />
  return <IconDim />
}

function writeDim(dim: boolean): void {
  if (dim) document.documentElement.dataset.themeVariant = 'dim'
  else delete document.documentElement.dataset.themeVariant
  try {
    if (dim) localStorage.setItem(DIM_STORAGE_KEY, '1')
    else localStorage.removeItem(DIM_STORAGE_KEY)
  } catch {
    // Storage can be blocked; the attribute still applies for this visit.
  }
}

export default function NavbarColorModeToggle({ className }: Props): ReactNode {
  const { disableSwitch } = useThemeConfig().colorMode
  const { colorMode, setColorMode } = useColorMode()
  const isBrowser = useIsBrowser()
  const [dim, setDim] = useState(false)

  useEffect(() => {
    setDim(isDim())
  }, [])

  if (disableSwitch) return null

  const current: ThemeChoice = colorMode === 'dark' && dim ? 'dim' : colorMode

  const choose = (choice: ThemeChoice) => {
    writeDim(choice === 'dim')
    setDim(choice === 'dim')
    setColorMode(choice === 'light' ? 'light' : 'dark')
  }

  return (
    <fieldset
      className={clsx('bitrate-theme-switch', styles.switch, className)}
      disabled={!isBrowser}
    >
      <legend className={styles.srOnly}>Theme</legend>
      {CHOICES.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          className={clsx('clean-btn', styles.option)}
          aria-pressed={current === value}
          title={label}
          onClick={() => choose(value)}
        >
          <ChoiceIcon choice={value} />
          <span className={styles.srOnly}>{label}</span>
        </button>
      ))}
    </fieldset>
  )
}
