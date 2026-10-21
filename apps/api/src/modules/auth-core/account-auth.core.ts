import { randomBytes } from 'node:crypto'
import type { LoginResult } from '@common/auth.types'
import type { JWTPayload } from '@modules/tokens'
import type { TokenService } from '@modules/tokens/token.service'
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common'
import type { JwtService } from '@nestjs/jwt'

/** The account kinds that sign in with a password and a session cookie pair. */
export type AuthAudience = Extract<JWTPayload['type'], 'user' | 'artist'>

/** Failed password attempts before an account is locked. */
const MAX_LOGIN_ATTEMPTS = 5
/** How long a locked account stays locked. */
const LOCK_DURATION_MS = 15 * 60 * 1000
/** Lifetime of a password-reset link. */
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000
/** Lifetime of an email-verification link. */
const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000

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

/**
 * Password login, lockout, sessions, password reset and email-verification tokens, shared by
 * every audience in {@link AuthAudience}. Registration, mail delivery and session listing stay in
 * the audience's own service: their rules differ.
 */
export class AccountAuthCore<Account extends AuthCredentials, Client> {
  /** Creates a core over one audience's store. */
  constructor(
    private readonly store: AccountAuthStore<Account, Client>,
    private readonly token: TokenService,
    private readonly jwt: JwtService,
    private readonly options: AccountAuthOptions,
  ) {}

  /** Checks the password, applies lockout, and issues a session or a two-factor challenge. */
  async login(email: string, password: string, client: Client): Promise<LoginResult> {
    const account = await this.store.findByEmail(email)
    if (account?.lockedUntil && account.lockedUntil > new Date()) {
      throw new HttpException('Account is temporarily locked', HttpStatus.TOO_MANY_REQUESTS)
    }

    const passwordValid =
      account?.password && (await this.token.verifyPassword(password, account.password))
    if (!passwordValid) {
      if (account) await this.recordFailedLogin(account.id)
      throw new UnauthorizedException({ message: 'Invalid credentials' })
    }

    if (!account.emailVerifiedAt) {
      throw new UnauthorizedException({ message: 'Email address is not verified' })
    }

    if (account.failedLoginAttempts > 0 || account.lockedUntil) {
      await this.store.resetFailedLogins(account.id)
    }

    if (account.twoFactorEnabled) {
      const pendingToken = await this.token.generateTwoFAPendingToken(account.id)
      return { requires2fa: true as const, pendingToken }
    }

    return this.issueSession(account, client)
  }

  /** Issues the session a verified two-factor code was waiting for. */
  async completeTwoFactorLogin(accountId: string, client: Client) {
    const account = await this.store.findForTwoFactorLogin(accountId)
    if (!account) throw this.options.twoFactorAccountMissing()
    return this.issueSession(account, client)
  }

  /** Rotates a session's token pair; any failure reads as an invalid refresh token. */
  async refresh(refreshToken: string, client: Client) {
    try {
      const payload = await this.jwt.verifyAsync<JWTPayload>(refreshToken, {
        secret: process.env.JWT_SECRET,
      })
      const account = await this.store.findForSession(payload.sub)
      if (!account) throw new UnauthorizedException('Invalid refresh token')

      const [access_token, next_refresh_token] = await this.signTokenPair(account)

      const updatedSessions = await this.store.rotateSession(
        account.id,
        this.token.hashToken(refreshToken),
        {
          access_token: this.token.hashToken(access_token),
          refresh_token: this.token.hashToken(next_refresh_token),
          expiresAt: this.token.getRefreshTokenExpiresAt(),
        },
        client,
      )

      if (updatedSessions.count !== 1) {
        throw new UnauthorizedException('Invalid refresh token')
      }

      return { access_token, refresh_token: next_refresh_token }
    } catch {
      throw new UnauthorizedException('Invalid refresh token')
    }
  }

  /** Ends the session the access token belongs to. */
  async logout(accountId: string, accessToken: string) {
    const account = await this.store.findForSession(accountId)
    if (!account) {
      throw new UnauthorizedException('Invalid access token')
    }
    await this.store.deleteSession(account.id, this.token.hashToken(accessToken))
  }

  /**
   * Replaces the account's reset token and returns the raw token for the audience to mail.
   * Returns nothing for an unknown email, so the caller never reveals whether it exists.
   */
  async createPasswordReset(email: string) {
    const account = await this.store.findByEmail(email)
    if (!account) return undefined

    const rawToken = randomBytes(32).toString('hex')
    await this.store.replacePasswordReset(
      account.id,
      this.token.hashToken(rawToken),
      new Date(Date.now() + PASSWORD_RESET_TTL_MS),
    )
    return { account, rawToken }
  }

  /** Sets a new password from a valid reset token and signs the account out everywhere. */
  async resetPassword(rawToken: string, newPassword: string) {
    const hashed = this.token.hashToken(rawToken)
    const reset = await this.store.findPasswordReset(hashed)

    if (!reset || reset.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token')
    }

    await this.store.applyPasswordReset(
      reset.accountId,
      hashed,
      await this.token.hashPassword(newPassword),
    )
  }

  /** Verifies an email token once and removes all outstanding tokens for the account. */
  async verifyEmail(rawToken: string) {
    const verification = await this.store.findEmailVerification(this.token.hashToken(rawToken))
    if (!verification || verification.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired verification token')
    }
    await this.store.markEmailVerified(verification.accountId)
  }

  /** Replaces the account's verification token and returns the raw token to mail. */
  async issueEmailVerificationToken(accountId: string) {
    const rawToken = randomBytes(32).toString('hex')
    await this.store.replaceEmailVerification(
      accountId,
      this.token.hashToken(rawToken),
      new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS),
    )
    return rawToken
  }

  private async issueSession(account: SessionAccount, client: Client) {
    const [access_token, refresh_token] = await this.signTokenPair(account)

    await this.store.createSession(
      account.id,
      {
        access_token: this.token.hashToken(access_token),
        refresh_token: this.token.hashToken(refresh_token),
        expiresAt: this.token.getRefreshTokenExpiresAt(),
      },
      client,
    )

    return { access_token, refresh_token }
  }

  /** Signs the access and refresh tokens of one session concurrently. */
  private signTokenPair(account: SessionAccount): Promise<[string, string]> {
    const { audience } = this.options
    return Promise.all([
      this.token.generateAccessToken(account.id, account.username, audience),
      this.token.generateRefreshToken(account.id, account.username, audience),
    ])
  }

  /**
   * Increments the failure counter and locks the account once it reaches
   * MAX_LOGIN_ATTEMPTS. The store uses typed writes rather than raw SQL: a bind parameter inside
   * a raw `CASE ... ELSE NULL` carries no type, so Postgres resolved the whole expression to
   * `text` and rejected the assignment to the `timestamp(3)` column (SQLSTATE 42804).
   */
  private async recordFailedLogin(accountId: string) {
    const updated = await this.store.incrementFailedLogins(accountId)
    if (!updated) return

    const locked = updated.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS
    if (!locked && updated.lockedUntil === null) return

    await this.store.setLockedUntil(
      accountId,
      locked ? new Date(Date.now() + LOCK_DURATION_MS) : null,
    )
  }
}
