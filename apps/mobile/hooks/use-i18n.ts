import { createTranslator, type Translate } from '@/lib/i18n/create-translator'
import { detectDeviceLocale, type Locale } from '@/lib/i18n/locales'
import { usePreferencesStore } from '@/lib/preferences/preferences-store'

export type I18n = {
  locale: Locale
  t: Translate
}

/** The translator for the user's chosen language, or the device language by default. */
export function useI18n(): I18n {
  const preference = usePreferencesStore((state) => state.locale)
  const locale = preference === 'system' ? detectDeviceLocale() : preference
  return { locale, t: createTranslator(locale) }
}
