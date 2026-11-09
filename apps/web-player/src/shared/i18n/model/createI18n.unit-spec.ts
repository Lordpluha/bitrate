import { describe, expect, it } from 'vitest'
import {
  createI18n,
  isTranslationKey,
  translateMessage,
} from '@/shared/i18n/model/createI18n'
import { pickSupportedLocale } from '@/shared/i18n/model/i18n.types'

describe('translateMessage', () => {
  it('translates a catalog key, such as a schema message', () => {
    const { t } = createI18n({ locale: 'pl' })

    expect(
      translateMessage({ message: 'validation.password.mismatch', t }),
    ).toBe('Hasła nie są zgodne')
  })

  it('keeps text that is not a key, such as a reason from the API', () => {
    const { t } = createI18n({ locale: 'uk' })

    expect(translateMessage({ message: 'Invalid email or password', t })).toBe(
      'Invalid email or password',
    )
  })

  it('does not treat inherited object properties as keys', () => {
    expect(isTranslationKey('toString')).toBe(false)
  })
})

describe('pickSupportedLocale', () => {
  it('matches a regional tag by its language', () => {
    expect(pickSupportedLocale(['uk-UA', 'en-US'])).toBe('uk')
  })

  it('skips unsupported languages for the next preferred one', () => {
    expect(pickSupportedLocale(['de-DE', 'pl'])).toBe('pl')
  })

  it('has no answer when no preferred language is supported', () => {
    expect(pickSupportedLocale(['de-DE', 'fr'])).toBeNull()
  })
})
