import { createHash } from 'node:crypto'
import type { AppConfig } from '@common/config'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import * as argon2 from 'argon2'
import type { Response } from 'express'
import ms, { type StringValue } from 'ms'
import {
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
  ): Promise<string> {
    return await this.jwtService.signAsync(
      { username, type },
      {
        subject: entityId,
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
  ): Promise<string> {
    return await this.jwtService.signAsync(
      { username, type },
      {
        subject: entityId,
        expiresIn: this.refreshTokenExpiry,
        secret: this.configService.getOrThrow('JWT_SECRET'),
      },
    )
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
    const base = this.configService.getOrThrow('cookie')

    res.cookie(sessionCookieName(audience, 'access'), accessToken, {
      ...base,
      maxAge: ms(this.accessTokenExpiry),
    })
    res.cookie(sessionCookieName(audience, 'refresh'), refreshToken, {
      ...base,
      maxAge: ms(this.refreshTokenExpiry),
    })
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
    const options = this.clearCookieOptions()

    res.clearCookie(sessionCookieName(audience, 'access'), options)
    res.clearCookie(sessionCookieName(audience, 'refresh'), options)
    this.clearLegacyCookies(res, options)
  }

  /** Drops the session cookies every audience shared before the names were split. */
  private clearLegacyCookies(res: Response, options = this.clearCookieOptions()) {
    for (const name of LEGACY_SESSION_COOKIE_NAMES) res.clearCookie(name, options)
  }

  /** The scope a session cookie was written with, which clearing it has to repeat. */
  private clearCookieOptions() {
    const { httpOnly, sameSite, secure, path, domain } = this.configService.getOrThrow('cookie')
    return { httpOnly, sameSite, secure, path, ...(domain ? { domain } : {}) }
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
