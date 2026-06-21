import { createHash } from 'node:crypto'
import type { AppConfig } from '@common/config'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import * as argon2 from 'argon2'
import { Response } from 'express'
import { type StringValue } from 'ms'
import { JWTPayload } from '../tokens'

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
  async generateAccessToken(entityId: string, username: string): Promise<string> {
    return await this.jwtService.signAsync(
      { username },
      {
        subject: entityId,
        expiresIn: this.accessTokenExpiry,
        secret: this.configService.getOrThrow('JWT_SECRET'),
      },
    )
  }

  /** Runs the generate refresh token operation. */
  async generateRefreshToken(entityId: string, username: string): Promise<string> {
    return await this.jwtService.signAsync(
      { username },
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

  /** Runs the set auth cookies operation. */
  setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    const cookieConfig = this.configService.getOrThrow('cookie')

    res.cookie(this.configService.getOrThrow('ACCESS_TOKEN_NAME'), accessToken, cookieConfig)
    res.cookie(this.configService.getOrThrow('REFRESH_TOKEN_NAME'), refreshToken, cookieConfig)
  }

  /** Runs the clear auth cookies operation. */
  clearAuthCookies(res: Response) {
    res.clearCookie(this.configService.getOrThrow('ACCESS_TOKEN_NAME'))
    res.clearCookie(this.configService.getOrThrow('REFRESH_TOKEN_NAME'))
  }

  /** Runs the hash token operation. */
  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex')
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
