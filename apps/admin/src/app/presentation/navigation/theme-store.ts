import { Injectable, signal } from '@angular/core'

/** The storage key `index.html`'s no-flash script reads before Angular ever boots. */
export const THEME_STORAGE_KEY = 'bitrate.admin.theme'

export const THEMES = ['dark', 'light', 'dim'] as const

export type Theme = (typeof THEMES)[number]

export const DEFAULT_THEME: Theme = 'dark'

/**
 * The operator's chosen colour theme — dark (default), light, or dim — applied as a class on
 * `<html>` and remembered per browser.
 *
 * `index.html` carries an inline script with the same storage key, theme list and fallback so
 * the very first paint already matches the stored theme, before Angular's bundle has even
 * loaded — the analogue of web-player's `ThemeScript`. This store re-applies the class
 * defensively on construction (idempotent: it just removes and re-adds the same classes) and
 * owns every change after that. If the two ever drift, `theme-store.unit-spec.ts` and a manual
 * check of `index.html` are what would catch it; nothing wires them together mechanically.
 *
 * `localStorage` is wrapped in try/catch on both sides — see `SidebarWidth` for why: a private
 * window, cleared site data or storage blocked by the browser all throw on access rather than
 * returning `null`, and a colour preference is never worth failing a page load over.
 */
@Injectable({ providedIn: 'root' })
export class ThemeStore {
  private readonly current = signal<Theme>(read())

  readonly theme = this.current.asReadonly()

  constructor() {
    applyTheme(this.current())
  }

  setTheme(theme: Theme): void {
    this.current.set(theme)
    applyTheme(theme)
    write(theme)
  }

  /** Dark → light → dim → dark. Drives the single-button toggle in the sidebar footer. */
  cycle(): void {
    const index = THEMES.indexOf(this.current())
    const next = THEMES[(index + 1) % THEMES.length] ?? DEFAULT_THEME
    this.setTheme(next)
  }
}

function applyTheme(theme: Theme): void {
  document.documentElement.classList.remove(...THEMES)
  document.documentElement.classList.add(theme)
}

function isTheme(value: string | null): value is Theme {
  return THEMES.includes(value as Theme)
}

function read(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return isTheme(stored) ? stored : DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}

function write(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    /* A remembered theme is a convenience; losing it is not an error worth surfacing. */
  }
}
