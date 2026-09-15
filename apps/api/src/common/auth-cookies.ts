import type { Response } from 'express'

/** Holds the half-finished login while the user fetches their 2FA code. */
const PENDING_2FA_COOKIE = 'pending_2fa_token'

/** Ties an OAuth redirect back to the browser that started it. */
export const OAUTH_STATE_COOKIE = 'oauth_state'

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
