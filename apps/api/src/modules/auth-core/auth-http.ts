import { UnauthorizedException } from '@nestjs/common'
import type { TokenRequirement } from './session-auth.guard'
import { UNAUTHORIZED_ERRORS } from './unauthorized.errors'

/**
 * The raw session token the session guard verified and stored on the request under its cookie
 * name. Only routes behind that guard carry one; a missing token fails closed as unauthorized.
 */
export function readSessionToken(request: object, kind: TokenRequirement): string {
  const name = kind === 'access' ? process.env.ACCESS_TOKEN_NAME : process.env.REFRESH_TOKEN_NAME
  const token: unknown = name ? Reflect.get(request, name) : undefined
  if (typeof token !== 'string' || !token) {
    throw new UnauthorizedException(UNAUTHORIZED_ERRORS.INVALID_OR_EXPIRED_TOKEN)
  }
  return token
}

/** The verified access token of a guarded request. */
export function readAccessToken(request: object): string {
  return readSessionToken(request, 'access')
}

/** The verified refresh token of a guarded `refresh` request. */
export function readRefreshToken(request: object): string {
  return readSessionToken(request, 'refresh')
}
