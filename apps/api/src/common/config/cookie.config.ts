import { registerAs } from '@nestjs/config'

/**
 * The cookie config value.
 *
 * `domain` is what lets a session issued by the API on one subdomain be read by
 * the web apps on another. Left unset the cookie is host-only, so a login on
 * `api.<domain>` is invisible to the Next route guard running on `<domain>` and
 * every authenticated route bounces straight back to the login page.
 * Unset is still correct for localhost, where both sides share a host.
 */
export const cookieConfig = registerAs('cookie', () => ({
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
}))
