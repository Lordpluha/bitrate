import { ROUTES } from './routes'

/** Accept only local dashboard destinations, never an external URL or a login loop. */
export function getLoginDestination(destination: unknown): string {
  if (typeof destination !== 'string' || !destination.startsWith('/')) {
    return ROUTES.dashboard.home
  }

  try {
    const decoded = decodeURIComponent(destination)
    const hasControlCharacters = [...decoded].some(
      (character) => character.charCodeAt(0) < 32,
    )
    if (
      decoded.startsWith('//') ||
      /[\\\s]/.test(decoded) ||
      hasControlCharacters
    ) {
      return ROUTES.dashboard.home
    }
    const url = new URL(destination, 'https://bitrate.invalid')
    if (
      url.origin !== 'https://bitrate.invalid' ||
      (url.pathname !== ROUTES.dashboard.home &&
        !url.pathname.startsWith(`${ROUTES.dashboard.home}/`))
    ) {
      return ROUTES.dashboard.home
    }
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return ROUTES.dashboard.home
  }
}
