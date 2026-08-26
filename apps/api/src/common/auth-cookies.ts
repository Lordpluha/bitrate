import type { CookieOptions, Response } from 'express'

/** Holds the half-finished login while the user fetches their 2FA code. */
export const PENDING_2FA_COOKIE = 'pending_2fa_token'

/** Ties an OAuth redirect back to the browser that started it. */
export const OAUTH_STATE_COOKIE = 'oauth_state'

/** A pending 2FA challenge is only valid for ten minutes. */
const PENDING_2FA_MAX_AGE_MS = 10 * 60 * 1000

/** An OAuth round trip should complete well inside five minutes. */
const OAUTH_STATE_MAX_AGE_MS = 5 * 60 * 1000

/** Shared hardening for every short-lived authentication cookie. */
const baseOptions = (): CookieOptions => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
})

/** Stores the pending-2FA token that `2fa/verify-login` exchanges for a session. */
export function setPendingTwoFactorCookie(res: Response, token: string): void {
  res.cookie(PENDING_2FA_COOKIE, token, { ...baseOptions(), maxAge: PENDING_2FA_MAX_AGE_MS })
}

/** Drops the pending-2FA token once the challenge is resolved. */
export function clearPendingTwoFactorCookie(res: Response): void {
  res.clearCookie(PENDING_2FA_COOKIE, { path: '/' })
}

/** Stores the CSRF state an OAuth callback is required to echo back. */
export function setOAuthStateCookie(res: Response, state: string): void {
  res.cookie(OAUTH_STATE_COOKIE, state, { ...baseOptions(), maxAge: OAUTH_STATE_MAX_AGE_MS })
}

/** Drops the OAuth state once the callback has been matched against it. */
export function clearOAuthStateCookie(res: Response): void {
  res.clearCookie(OAUTH_STATE_COOKIE)
}
