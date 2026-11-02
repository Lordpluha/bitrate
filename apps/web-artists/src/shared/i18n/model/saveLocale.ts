import { createServerFn } from '@tanstack/react-start'
import { setCookie } from '@tanstack/react-start/server'
import { isLocale, LOCALE_COOKIE } from './locale'

const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

/** Remembers the artist's language so the server renders the next page in it. */
export const saveLocale = createServerFn({ method: 'POST' })
  .validator((locale: unknown) => {
    if (!isLocale(locale)) throw new Error('Unsupported locale')
    return locale
  })
  .handler(({ data }) => {
    setCookie(LOCALE_COOKIE, data, {
      maxAge: LOCALE_COOKIE_MAX_AGE,
      path: '/',
      sameSite: 'lax',
    })
  })
