import { ROUTES } from '@shared/routes/routes'

/**
 * Whether a request that stays unauthorised after a refresh should send the browser to the
 * login page. Only the protected workspace does: a guest on a public page — the landing,
 * password recovery, legal pages or a 404 — is expected to be signed out and must stay put.
 */
export function redirectsToLoginOnExpiry(pathname: string): boolean {
  const home = ROUTES.dashboard.home
  return pathname === home || pathname.startsWith(`${home}/`)
}
