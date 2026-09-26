import { Injectable, computed, inject } from '@angular/core'
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_STORAGE_KEY,
  type AppLocale,
  isAppLocale,
  readPersistedLocale,
} from '@domain/locale'
import { TranslocoService } from '@jsverse/transloco'

export { DEFAULT_LOCALE, LOCALES, LOCALE_STORAGE_KEY, type AppLocale }

/**
 * The operator's chosen interface language — English (default) or Ukrainian — applied through
 * Transloco and remembered per browser. Shaped like `ThemeStore`: a signal, a value persisted to
 * `localStorage`, and a `cycle()` that drives the single-button sidebar control — same recipe,
 * a different preference.
 *
 * `locale` is derived from `TranslocoService.activeLang` rather than kept in a second signal, so
 * there is exactly one source of truth for "what language is active right now" — this store adds
 * the typed `AppLocale` surface, `localStorage` persistence, and the cycle button on top of it.
 */
@Injectable({ providedIn: 'root' })
export class LocaleStore {
  private readonly transloco = inject(TranslocoService)

  readonly locale = computed<AppLocale>(() => {
    const active = this.transloco.activeLang()
    return isAppLocale(active) ? active : DEFAULT_LOCALE
  })

  constructor() {
    this.transloco.setActiveLang(readPersistedLocale())
  }

  setLocale(locale: AppLocale): void {
    this.transloco.setActiveLang(locale)
    write(locale)
  }

  /** English → Ukrainian → English. Drives the single-button toggle in the sidebar footer. */
  cycle(): void {
    const index = LOCALES.indexOf(this.locale())
    const next = LOCALES[(index + 1) % LOCALES.length] ?? DEFAULT_LOCALE
    this.setLocale(next)
  }
}

function write(locale: AppLocale): void {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch {
    /* A remembered locale is a convenience; losing it is not an error worth surfacing. */
  }
}
