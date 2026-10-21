import type { JWTPayload } from '@modules/tokens'
import type { HttpException } from '@nestjs/common'

/** The account kinds that sign in with a password and a session cookie pair. */
export type AuthAudience = Extract<JWTPayload['type'], 'user' | 'artist'>

/** The account fields password login and recovery read. */
export interface AuthCredentials {
  id: string
  username: string
  email: string
  password: string | null
  emailVerifiedAt: Date | null
  failedLoginAttempts: number
  lockedUntil: Date | null
  twoFactorEnabled: boolean
  locale: string
}

/** The identity a session is issued to. */
export interface SessionAccount {
  id: string
  username: string
}

/** An account about to be signed in, and whether it must pass a two-factor challenge first. */
export interface SignInAccount extends SessionAccount {
  twoFactorEnabled: boolean
}

/** Hashed token pair and expiry of one session. */
export interface SessionTokens {
  access_token: string
  refresh_token: string
  expiresAt: Date
}

/** A single-use token (password reset or email verification) looked up by its hash. */
interface AccountTokenRecord {
  accountId: string
  expiresAt: Date
}

/**
 * The persistence an audience supplies to {@link AccountAuthCore}. Each audience implements it
 * in its own module, so every write to its account, session and token tables stays with the
 * module that owns them; the core holds only the rules.
 *
 * `Client` is whatever the audience records about the device on a session (artists keep the
 * user agent and last use; users keep nothing).
 */
export interface AccountAuthStore<Account extends AuthCredentials, Client> {
  findByEmail(email: string): Promise<Account | null>
  /** The account a completed two-factor login is issued to. */
  findForTwoFactorLogin(id: string): Promise<SessionAccount | null>
  /** The account a refresh or logout acts on. */
  findForSession(id: string): Promise<SessionAccount | null>

  resetFailedLogins(id: string): Promise<unknown>
  /** Adds one failed attempt and returns the new count, or nothing when the account is gone. */
  incrementFailedLogins(
    id: string,
  ): Promise<Pick<AuthCredentials, 'failedLoginAttempts' | 'lockedUntil'> | undefined>
  setLockedUntil(id: string, lockedUntil: Date | null): Promise<unknown>

  createSession(accountId: string, tokens: SessionTokens, client: Client): Promise<unknown>
  /** Swaps the session holding `refreshTokenHash` to new tokens; returns how many rows moved. */
  rotateSession(
    accountId: string,
    refreshTokenHash: string,
    next: SessionTokens,
    client: Client,
  ): Promise<{ count: number }>
  deleteSession(accountId: string, accessTokenHash: string): Promise<unknown>

  /** Drops every outstanding reset for the account and stores the new one. */
  replacePasswordReset(accountId: string, tokenHash: string, expiresAt: Date): Promise<unknown>
  findPasswordReset(tokenHash: string): Promise<AccountTokenRecord | null>
  /** Sets the password, consumes the reset and ends every session, atomically. */
  applyPasswordReset(accountId: string, tokenHash: string, passwordHash: string): Promise<unknown>

  /** Drops every outstanding verification for the account and stores the new one, atomically. */
  replaceEmailVerification(accountId: string, tokenHash: string, expiresAt: Date): Promise<unknown>
  findEmailVerification(tokenHash: string): Promise<AccountTokenRecord | null>
  /** Marks the email verified and drops every outstanding verification, atomically. */
  markEmailVerified(accountId: string): Promise<unknown>
}

/** Audience-specific choices the shared rules cannot make. */
export interface AccountAuthOptions {
  audience: AuthAudience
  /** Thrown when a two-factor login finishes for an account that no longer exists. */
  twoFactorAccountMissing: () => HttpException
}
