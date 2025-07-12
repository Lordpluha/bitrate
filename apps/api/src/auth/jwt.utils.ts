import { Response } from 'express'

const isProd = process.env.NODE_ENV === 'production'
const defaultOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: isProd,
}

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string
) {
  res.cookie(process.env.ACCESS_TOKEN_NAME!, accessToken, defaultOptions)
  res.cookie(process.env.REFRESH_TOKEN_NAME!, refreshToken, defaultOptions)
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(process.env.ACCESS_TOKEN_NAME!)
  res.clearCookie(process.env.REFRESH_TOKEN_NAME!)
}