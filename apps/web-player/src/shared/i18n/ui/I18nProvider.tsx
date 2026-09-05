'use client'

import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
} from 'react'
import { de } from '@/shared/i18n/messages/de'
import {
  en,
  type Messages,
  type TranslationKey,
} from '@/shared/i18n/messages/en'
import { pl } from '@/shared/i18n/messages/pl'
import { ru } from '@/shared/i18n/messages/ru'
import { uk } from '@/shared/i18n/messages/uk'
import type { Locale, TranslationValues } from '@/shared/i18n/model/i18n.types'

const catalogs: Record<Locale, Messages> = { de, en, pl, ru, uk }

type I18nContextValue = {
  locale: Locale
  t: (key: TranslationKey, values?: TranslationValues) => string
}

const interpolate = (message: string, values?: TranslationValues) => {
  if (!values) return message

  return message.replace(/\{(\w+)\}/g, (placeholder, key: string) => {
    const value = values[key]
    return value === undefined ? placeholder : String(value)
  })
}

const defaultContext: I18nContextValue = {
  locale: 'en',
  t: (key, values) => interpolate(en[key], values),
}

const I18nContext = createContext<I18nContextValue>(defaultContext)

type I18nProviderProps = PropsWithChildren<{ locale: Locale }>

export const I18nProvider = ({ children, locale }: I18nProviderProps) => {
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const value = useMemo<I18nContextValue>(() => {
    const messages = catalogs[locale]
    return {
      locale,
      t: (key, values) => interpolate(messages[key] ?? en[key], values),
    }
  }, [locale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const useI18n = () => useContext(I18nContext)
