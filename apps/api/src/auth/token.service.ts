import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Response } from 'express'

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  private isProd = process.env.NODE_ENV === 'production'
  private defaultOptions = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: this.isProd
  }

  async generateAccessToken(userId: string, username: string): Promise<string> {
    return this.jwtService.signAsync(
      { username },
      {
        subject: userId,
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
        secret: process.env.ACCESS_TOKEN_SECRET
      }
    )
  }

  async generateRefreshToken(
    userId: string,
    username: string
  ): Promise<string> {
    return this.jwtService.signAsync(
      { username },
      {
        subject: userId,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
        secret: process.env.REFRESH_TOKEN_SECRET
      }
    )
  }

  setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie(process.env.ACCESS_TOKEN_NAME!, accessToken, this.defaultOptions)
    res.cookie(
      process.env.REFRESH_TOKEN_NAME!,
      refreshToken,
      this.defaultOptions
    )
  }

  clearAuthCookies(res: Response) {
    res.clearCookie(process.env.ACCESS_TOKEN_NAME!)
    res.clearCookie(process.env.REFRESH_TOKEN_NAME!)
  }
}
