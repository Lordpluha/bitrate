import { createIsomorphicFn } from '@tanstack/react-start'
import { getCookie, getRequestHeader } from '@tanstack/react-start/server'
import { LOCALE_COOKIE, readLocaleCookie, resolveLocale } from './locale'

/** The locale to render: the saved cookie, else the browser's languages, on either side. */
export const getRequestLocale = createIsomorphicFn()
  .server(() =>
    resolveLocale({
      cookie: getCookie(LOCALE_COOKIE),
      acceptLanguage: getRequestHeader('accept-language'),
    }),
  )
  .client(() =>
    resolveLocale({
      cookie: readLocaleCookie(document.cookie),
      acceptLanguage: navigator.languages.join(','),
    }),
  )
