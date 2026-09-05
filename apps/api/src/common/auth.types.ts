/** A completed sign-in: the token pair a session is built from. */
type AuthTokenPair = {
  access_token: string
  refresh_token: string
}

/** A sign-in held back until the account answers its second factor. */
type PendingTwoFactorLogin = {
  requires2fa: true
  pendingToken: string
}

/**
 * What a sign-in attempt yields: a session, or a pending 2FA challenge.
 *
 * Shared by the listener and artist flows, which return the same shape from
 * password login and from every OAuth callback.
 */
export type LoginResult = AuthTokenPair | PendingTwoFactorLogin
