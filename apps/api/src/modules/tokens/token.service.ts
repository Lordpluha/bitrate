import type { AppConfig } from '@common/config'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Response } from 'express'
import { type StringValue } from 'ms'
import { JWTPayload } from '../tokens'

@Injectable()
export class TokenService {
  private readonly accessTokenExpiry: StringValue
  private readonly refreshTokenExpiry: StringValue

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AppConfig>,
  ) {
    this.accessTokenExpiry = this.configService.getOrThrow('JWT_ACCESS_EXPIRES_IN')

    this.refreshTokenExpiry = this.configService.getOrThrow('JWT_REFRESH_EXPIRES_IN')
  }

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

  async verifyToken(token: string): Promise<JWTPayload> {
    return await this.jwtService.verifyAsync<JWTPayload>(token, {
      secret: this.configService.getOrThrow('JWT_SECRET'),
    })
  }

  setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    const cookieConfig = this.configService.getOrThrow('cookie')

    res.cookie(this.configService.getOrThrow('ACCESS_TOKEN_NAME'), accessToken, cookieConfig)
    res.cookie(this.configService.getOrThrow('REFRESH_TOKEN_NAME'), refreshToken, cookieConfig)
  }

  clearAuthCookies(res: Response) {
    res.clearCookie(this.configService.getOrThrow('ACCESS_TOKEN_NAME'))
    res.clearCookie(this.configService.getOrThrow('REFRESH_TOKEN_NAME'))
  }
}
