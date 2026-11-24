/**
 * Whether an `href` is a route inside this renderer rather than an external page.
 *
 * Absolute URLs on the renderer's own origin count as in-app; any other scheme or host
 * (`https://…`, `mailto:`) is left to the browser, where the native shell opens it in the
 * system browser.
 */
export const isInAppHref = (href: string): boolean => {
  if (href.startsWith('/') && !href.startsWith('//')) return true
  if (href.startsWith('#') || href.startsWith('?')) return true

  try {
    return new URL(href).origin === window.location.origin
  } catch {
    return false
  }
}
