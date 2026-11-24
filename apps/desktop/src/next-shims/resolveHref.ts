/** The subset of Next's `UrlObject` the reused code passes to `Link` and `router.push`. */
export type NextUrlObject = {
  pathname?: string | null
  query?: Record<string, string | number | boolean | undefined> | string | null
  hash?: string | null
}

/** A Next.js `href`: a string, or a URL object to serialize. */
export type NextHref = string | NextUrlObject

const serializeQuery = (query: NextUrlObject['query']) => {
  if (!query) return ''
  if (typeof query === 'string') return query.startsWith('?') ? query : `?${query}`

  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) params.set(key, String(value))
  }
  const search = params.toString()
  return search ? `?${search}` : ''
}

/** Turns a Next.js `href` into the plain path-plus-search string the router history takes. */
export const resolveHref = (href: NextHref): string => {
  if (typeof href === 'string') return href

  const hash = href.hash ? `#${href.hash.replace(/^#/, '')}` : ''
  return `${href.pathname ?? ''}${serializeQuery(href.query)}${hash}`
}
