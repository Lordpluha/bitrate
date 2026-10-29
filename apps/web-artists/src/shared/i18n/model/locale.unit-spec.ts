import { describe, expect, it } from 'vitest'
import { LOCALE_COOKIE, readLocaleCookie, resolveLocale } from './locale'

describe('readLocaleCookie', () => {
  it('reads the locale from a document.cookie string', () => {
    expect(readLocaleCookie(`theme=dark; ${LOCALE_COOKIE}=uk; other=1`)).toBe(
      'uk',
    )
  })

  it('is undefined when the cookie is absent', () => {
    expect(readLocaleCookie(`x${LOCALE_COOKIE}=uk; theme=dark`)).toBeUndefined()
  })
})

describe('resolveLocale', () => {
  it('uses the saved cookie locale over the browser languages', () => {
    expect(
      resolveLocale({ cookie: 'pl', acceptLanguage: 'uk-UA,uk;q=0.9' }),
    ).toBe('pl')
  })

  it('ignores an unsupported cookie value', () => {
    expect(resolveLocale({ cookie: 'de', acceptLanguage: 'uk-UA' })).toBe('uk')
  })

  it('picks the most preferred supported browser language', () => {
    expect(
      resolveLocale({ acceptLanguage: 'de-DE,de;q=0.9,en;q=0.5,pl;q=0.7' }),
    ).toBe('pl')
  })

  it('falls back to English when nothing matches', () => {
    expect(resolveLocale({ acceptLanguage: 'de-DE,fr;q=0.8' })).toBe('en')
    expect(resolveLocale({})).toBe('en')
  })
})
