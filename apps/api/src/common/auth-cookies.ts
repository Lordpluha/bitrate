import type { Response } from 'express'

/** Holds the half-finished login while the user fetches their 2FA code. */
const PENDING_2FA_COOKIE = 'pending_2fa_token'

/** Ties an OAuth redirect back to the browser that started it. */
export const OAUTH_STATE_COOKIE = 'oauth_state'

/** Remembers which legal documents the user accepted before leaving for the OAuth provider. */
const OAUTH_ACCEPT_COOKIE = 'oauth_accept'

/** A pending 2FA challenge is only valid for ten minutes. */
const PENDING_2FA_MAX_AGE_MS = 10 * 60 * 1000

/** An OAuth round trip should complete well inside five minutes. */
const OAUTH_STATE_MAX_AGE_MS = 5 * 60 * 1000

/**
 * Whether short-lived auth cookies set `secure`, read fresh on every call.
 *
 * Inlined as a literal `secure:` key at each `res.cookie()` call site below
 * instead of spreading a shared options object — the spread hid both `httpOnly`
 * and `secure` from static cookie-hardening analysis.
 */
const isProductionEnv = (): boolean => process.env.NODE_ENV === 'production'

/** Stores the pending-2FA token that `2fa/verify-login` exchanges for a session. */
export function setPendingTwoFactorCookie(res: Response, token: string): void {
  res.cookie(PENDING_2FA_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProductionEnv(),
    path: '/',
    maxAge: PENDING_2FA_MAX_AGE_MS,
  })
}

/** Drops the pending-2FA token once the challenge is resolved. */
export function clearPendingTwoFactorCookie(res: Response): void {
  res.clearCookie(PENDING_2FA_COOKIE, { path: '/' })
}

/** Stores the CSRF state an OAuth callback is required to echo back. */
export function setOAuthStateCookie(res: Response, state: string): void {
  res.cookie(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProductionEnv(),
    path: '/',
    maxAge: OAUTH_STATE_MAX_AGE_MS,
  })
}

/** Drops the OAuth state once the callback has been matched against it. */
export function clearOAuthStateCookie(res: Response): void {
  res.clearCookie(OAUTH_STATE_COOKIE)
}

/** Acceptance flags a social sign-in start request can carry. */
export interface OAuthAcceptance {
  acceptLegal: boolean
  acceptArtistAgreement: boolean
}

const ACCEPT_LEGAL_TOKEN = 'legal'
const ACCEPT_ARTIST_AGREEMENT_TOKEN = 'artist-agreement'

/**
 * Remembers what was accepted across the provider round trip. Nothing is stored when
 * nothing was accepted, so a callback without the cookie reads as "not accepted".
 */
export function setOAuthAcceptCookie(res: Response, accepted: Partial<OAuthAcceptance>): void {
  const tokens = [
    accepted.acceptLegal ? ACCEPT_LEGAL_TOKEN : null,
    accepted.acceptArtistAgreement ? ACCEPT_ARTIST_AGREEMENT_TOKEN : null,
  ].filter((token): token is string => token !== null)
  if (tokens.length === 0) return

  res.cookie(OAUTH_ACCEPT_COOKIE, tokens.join(','), {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProductionEnv(),
    path: '/',
    maxAge: OAUTH_STATE_MAX_AGE_MS,
  })
}

/** Reads what the start request accepted; an absent or unknown cookie means nothing. */
export function readOAuthAcceptance(cookies: Record<string, string> | undefined): OAuthAcceptance {
  const tokens = (cookies?.[OAUTH_ACCEPT_COOKIE] ?? '').split(',')
  return {
    acceptLegal: tokens.includes(ACCEPT_LEGAL_TOKEN),
    acceptArtistAgreement: tokens.includes(ACCEPT_ARTIST_AGREEMENT_TOKEN),
  }
}

/** Drops the remembered acceptance once the callback has consumed it. */
export function clearOAuthAcceptCookie(res: Response): void {
  res.clearCookie(OAUTH_ACCEPT_COOKIE)
}
