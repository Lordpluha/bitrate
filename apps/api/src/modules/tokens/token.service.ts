import { createHash } from 'node:crypto'
import type { AppConfig } from '@common/config'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import * as argon2 from 'argon2'
import type { Request, Response } from 'express'
import ms, { type StringValue } from 'ms'
import {
  isHostOnlySession,
  JWTPayload,
  LEGACY_SESSION_COOKIE_NAMES,
  type SessionAudience,
  sessionCookieName,
} from '../tokens'

/** Represents the token service. */
@Injectable()
export class TokenService {
  /** The access token expiry value. */
  private readonly accessTokenExpiry: StringValue
  /** The refresh token expiry value. */
  private readonly refreshTokenExpiry: StringValue

  /** Creates a new instance. */
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AppConfig>,
  ) {
    this.accessTokenExpiry = this.configService.getOrThrow('JWT_ACCESS_EXPIRES_IN')

    this.refreshTokenExpiry = this.configService.getOrThrow('JWT_REFRESH_EXPIRES_IN')
  }

  /** Runs the generate access token operation. */
  async generateAccessToken(
    entityId: string,
    username: string,
    type: JWTPayload['type'],
    jwtid?: string,
  ): Promise<string> {
    return await this.jwtService.signAsync(
      { username, type },
      {
        subject: entityId,
        ...(jwtid ? { jwtid } : {}),
        expiresIn: this.accessTokenExpiry,
        secret: this.configService.getOrThrow('JWT_SECRET'),
      },
    )
  }

  /** Runs the generate refresh token operation. */
  async generateRefreshToken(
    entityId: string,
    username: string,
    type: JWTPayload['type'],
    jwtid?: string,
  ): Promise<string> {
    return await this.jwtService.signAsync(
      { username, type },
      {
        subject: entityId,
        ...(jwtid ? { jwtid } : {}),
        expiresIn: this.refreshTokenExpiry,
        secret: this.configService.getOrThrow('JWT_SECRET'),
      },
    )
  }

  /** Host-only, HttpOnly switcher credential; __Host- prevents cookie tossing in production. */
  artistAccountsCookieName() {
    return this.configService.getOrThrow('cookie').secure
      ? '__Host-artist_accounts'
      : 'artist_accounts'
  }

  setArtistAccountsCookie(res: Response, value: string) {
    const { secure } = this.configService.getOrThrow('cookie')
    res.cookie(this.artistAccountsCookieName(), value, {
      httpOnly: true,
      secure,
      sameSite: 'strict',
      path: '/',
      expires: this.getRefreshTokenExpiresAt(),
    })
  }

  /** Drops the switcher credential with the scope {@link setArtistAccountsCookie} wrote it. */
  clearArtistAccountsCookie(res: Response) {
    const { secure } = this.configService.getOrThrow('cookie')
    res.clearCookie(this.artistAccountsCookieName(), {
      httpOnly: true,
      secure,
      sameSite: 'strict',
      path: '/',
    })
  }

  /** The switcher credential this browser sent, if any. */
  readArtistAccountsCookie(req: Request): string | undefined {
    const value: unknown = req.cookies?.[this.artistAccountsCookieName()]
    return typeof value === 'string' ? value : undefined
  }

  /** Runs the verify token operation. */
  async verifyToken(token: string): Promise<JWTPayload> {
    return await this.jwtService.verifyAsync<JWTPayload>(token, {
      secret: this.configService.getOrThrow('JWT_SECRET'),
    })
  }

  /** Runs the generate two fapending token operation. */
  async generateTwoFAPendingToken(userId: string): Promise<string> {
    return await this.jwtService.signAsync(
      { twofa: true },
      { subject: userId, expiresIn: '10m', secret: this.configService.getOrThrow('JWT_SECRET') },
    )
  }

  /** Writes an audience's session cookie pair, dropping the pre-split shared names. */
  setAuthCookies(
    res: Response,
    audience: SessionAudience,
    accessToken: string,
    refreshToken: string,
  ) {
    const { domain, ...hostOnly } = this.configService.getOrThrow('cookie')
    const base = isHostOnlySession(audience) || !domain ? hostOnly : { ...hostOnly, domain }

    res.cookie(sessionCookieName(audience, 'access'), accessToken, {
      ...base,
      maxAge: ms(this.accessTokenExpiry),
    })
    res.cookie(sessionCookieName(audience, 'refresh'), refreshToken, {
      ...base,
      maxAge: ms(this.refreshTokenExpiry),
    })
    this.clearParentDomainStaffCookies(res, audience)
    this.clearLegacyCookies(res)
  }

  /**
   * Drops an audience's session cookie pair; other audiences' sessions are left alone.
   *
   * The clearing cookie has to carry the same `domain` and `path` the session was
   * written with — a bare `clearCookie` writes a host-only cookie that leaves a
   * domain-scoped session in place, so logout silently does nothing.
   */
  clearAuthCookies(res: Response, audience: SessionAudience) {
    const options = this.clearCookieOptions(isHostOnlySession(audience))

    res.clearCookie(sessionCookieName(audience, 'access'), options)
    res.clearCookie(sessionCookieName(audience, 'refresh'), options)
    this.clearParentDomainStaffCookies(res, audience)
    this.clearLegacyCookies(res)
  }

  /**
   * Drops staff cookies a session from before #458 wrote on the parent domain: a browser holding
   * both would also send the stale pair to the operator host. Remove once those sessions have
   * expired, one refresh-token lifetime after the release.
   */
  private clearParentDomainStaffCookies(res: Response, audience: SessionAudience) {
    const options = this.clearCookieOptions()
    if (audience !== 'staff' || !options.domain) return
    res.clearCookie(sessionCookieName('staff', 'access'), options)
    res.clearCookie(sessionCookieName('staff', 'refresh'), options)
  }

  /** Drops the session cookies every audience shared before the names were split. */
  private clearLegacyCookies(res: Response) {
    const options = this.clearCookieOptions()
    for (const name of LEGACY_SESSION_COOKIE_NAMES) res.clearCookie(name, options)
  }

  /** The scope a session cookie was written with, which clearing it has to repeat. */
  private clearCookieOptions(hostOnly = false) {
    const { httpOnly, sameSite, secure, path, domain } = this.configService.getOrThrow('cookie')
    return { httpOnly, sameSite, secure, path, ...(domain && !hostOnly ? { domain } : {}) }
  }

  /** Runs the hash token operation. */
  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex')
  }

  /** Returns the expiry date used for persisted refresh-token sessions. */
  getRefreshTokenExpiresAt(): Date {
    return new Date(Date.now() + ms(this.refreshTokenExpiry))
  }

  /** Runs the hash password operation. */
  async hashPassword(password: string): Promise<string> {
    return await argon2.hash(password, { type: argon2.argon2id })
  }

  /** Runs the verify password operation. */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await argon2.verify(hash, password)
  }
}
