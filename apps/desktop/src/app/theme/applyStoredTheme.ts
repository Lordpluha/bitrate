import { Themes } from '@shared/constants'

const DEFAULT_THEME = 'dark'

/**
 * Applies the saved theme class before React renders, so the window never flashes the wrong
 * palette. web-player does this with an inline `<script>`; the desktop CSP allows no inline
 * scripts, so it runs first in the entry module instead.
 */
export const applyStoredTheme = () => {
  const root = document.documentElement
  try {
    const stored = localStorage.getItem('theme')
    const theme = Themes.find((name) => name === stored) ?? DEFAULT_THEME
    root.classList.remove(...Themes)
    root.classList.add(theme)
  } catch {
    root.classList.add(DEFAULT_THEME)
  }
}
