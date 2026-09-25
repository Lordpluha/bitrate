import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { TranslocoTestingModule } from '@jsverse/transloco'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, LOCALES, LocaleStore } from './locale-store'

function create(): LocaleStore {
  TestBed.resetTestingModule()
  TestBed.configureTestingModule({
    imports: [
      TranslocoTestingModule.forRoot({
        langs: { en: {}, uk: {} },
        translocoConfig: { availableLangs: [...LOCALES], defaultLang: DEFAULT_LOCALE },
      }),
    ],
    providers: [provideZonelessChangeDetection()],
  })

  return TestBed.inject(LocaleStore)
}

describe('LocaleStore', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('starts on the default locale when nothing is stored', () => {
    const store = create()

    expect(store.locale()).toBe(DEFAULT_LOCALE)
  })

  describe('each locale applies correctly', () => {
    it.each(LOCALES)('setLocale(%s) updates the signal and storage', (locale) => {
      const store = create()
      store.setLocale(locale)

      expect(store.locale()).toBe(locale)
      expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe(locale)
    })
  })

  it('cycles English to Ukrainian and back to English', () => {
    const store = create()

    expect(store.locale()).toBe('en')
    store.cycle()
    expect(store.locale()).toBe('uk')
    store.cycle()
    expect(store.locale()).toBe('en')
  })

  describe('persistence', () => {
    it('restores a previously stored locale', () => {
      localStorage.setItem(LOCALE_STORAGE_KEY, 'uk')

      expect(create().locale()).toBe('uk')
    })

    /** A corrupted or unknown persisted value must never crash the app — it just resets. */
    it('falls back to the default locale on an unknown persisted value', () => {
      localStorage.setItem(LOCALE_STORAGE_KEY, 'fr')

      const store = create()

      expect(store.locale()).toBe(DEFAULT_LOCALE)
    })

    /** A private window throws on access rather than returning null. */
    it('survives storage that throws on read', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('denied')
      })

      expect(create().locale()).toBe(DEFAULT_LOCALE)
    })

    it('survives storage that throws on write', () => {
      const store = create()
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('quota')
      })

      expect(() => store.setLocale('uk')).not.toThrow()
      expect(store.locale()).toBe('uk')
    })
  })
})
