'use client'

import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
} from 'react'
import { createI18n, type I18n } from '@/shared/i18n/model/createI18n'
import type { Locale } from '@/shared/i18n/model/i18n.types'

const I18nContext = createContext<I18n>(createI18n({ locale: 'en' }))

type I18nProviderProps = PropsWithChildren<{ locale: Locale }>

export const I18nProvider = ({ children, locale }: I18nProviderProps) => {
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const value = useMemo(() => createI18n({ locale }), [locale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const useI18n = () => useContext(I18nContext)
