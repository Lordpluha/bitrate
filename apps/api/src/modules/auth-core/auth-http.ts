import { type SessionAudience, sessionCookieName } from '@modules/tokens'
import { UnauthorizedException } from '@nestjs/common'
import type { TokenRequirement } from './session-auth.guard'
import { UNAUTHORIZED_ERRORS } from './unauthorized.errors'

/**
 * The raw session token the session guard verified and stored on the request under its cookie
 * name. Only routes behind that guard carry one; a missing token fails closed as unauthorized.
 */
function readSessionToken(
  request: object,
  audience: SessionAudience,
  kind: TokenRequirement,
): string {
  const token: unknown = Reflect.get(request, sessionCookieName(audience, kind))
  if (typeof token !== 'string' || !token) {
    throw new UnauthorizedException(UNAUTHORIZED_ERRORS.INVALID_OR_EXPIRED_TOKEN)
  }
  return token
}

/** The verified access token of a guarded request. */
export function readAccessToken(request: object, audience: SessionAudience): string {
  return readSessionToken(request, audience, 'access')
}

/** The verified refresh token of a guarded `refresh` request. */
export function readRefreshToken(request: object, audience: SessionAudience): string {
  return readSessionToken(request, audience, 'refresh')
}
