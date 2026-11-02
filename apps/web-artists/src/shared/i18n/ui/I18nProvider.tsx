import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { createI18n, type I18n } from '../model/createI18n'
import type { Locale } from '../model/locale'
import { saveLocale } from '../model/saveLocale'

type I18nContextValue = I18n & {
  /** Switches the workspace language and remembers it in this browser. */
  setLocale: (locale: Locale) => void
}

const I18nContext = createContext<I18nContextValue>({
  ...createI18n({ locale: 'en' }),
  setLocale: () => {},
})

type I18nProviderProps = PropsWithChildren<{ initialLocale: Locale }>

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  const [locale, setLocale] = useState(initialLocale)

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const value = useMemo<I18nContextValue>(
    () => ({
      ...createI18n({ locale }),
      setLocale: (next) => {
        setLocale(next)
        // The switch already applies on screen; a failed save only means the next visit
        // falls back to the browser's language.
        saveLocale({ data: next }).catch(() => {})
      },
    }),
    [locale],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const useI18n = () => useContext(I18nContext)
