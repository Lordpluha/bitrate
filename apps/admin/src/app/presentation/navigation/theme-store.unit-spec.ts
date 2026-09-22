import { TestBed } from '@angular/core/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_THEME, THEME_STORAGE_KEY, THEMES, ThemeStore } from './theme-store'

function create(): ThemeStore {
  TestBed.resetTestingModule()
  return TestBed.inject(ThemeStore)
}

describe('ThemeStore', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove(...THEMES)
    vi.restoreAllMocks()
  })

  it('starts on the default theme when nothing is stored', () => {
    const store = create()

    expect(store.theme()).toBe(DEFAULT_THEME)
    expect(document.documentElement.classList.contains(DEFAULT_THEME)).toBe(true)
  })

  describe('each theme applies correctly', () => {
    it.each(THEMES)('setTheme(%s) updates the signal, the <html> class and storage', (theme) => {
      const store = create()
      store.setTheme(theme)

      expect(store.theme()).toBe(theme)
      expect(document.documentElement.classList.contains(theme)).toBe(true)
      for (const other of THEMES) {
        if (other !== theme) expect(document.documentElement.classList.contains(other)).toBe(false)
      }
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe(theme)
    })
  })

  it('cycles dark to light to dim and back to dark', () => {
    const store = create()

    expect(store.theme()).toBe('dark')
    store.cycle()
    expect(store.theme()).toBe('light')
    store.cycle()
    expect(store.theme()).toBe('dim')
    store.cycle()
    expect(store.theme()).toBe('dark')
  })

  describe('persistence', () => {
    it('restores a previously stored theme', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'light')

      expect(create().theme()).toBe('light')
      expect(document.documentElement.classList.contains('light')).toBe(true)
    })

    /** A corrupted or unknown persisted value must never crash the app — it just resets. */
    it('falls back to the default theme on an unknown persisted value', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'solarized')

      const store = create()

      expect(store.theme()).toBe(DEFAULT_THEME)
      expect(document.documentElement.classList.contains(DEFAULT_THEME)).toBe(true)
    })

    /** A private window throws on access rather than returning null. */
    it('survives storage that throws on read', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('denied')
      })

      expect(create().theme()).toBe(DEFAULT_THEME)
    })

    it('survives storage that throws on write', () => {
      const store = create()
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('quota')
      })

      expect(() => store.setTheme('dim')).not.toThrow()
      expect(store.theme()).toBe('dim')
    })
  })
})
