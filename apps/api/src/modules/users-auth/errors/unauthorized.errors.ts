/**
 * Message keys the `HttpExceptionFilter` translates — never literal English. Swagger's
 * `enum`/`example` in `users-auth.guard.ts` still read these directly, so the generated
 * OpenAPI contract documents the key rather than a rendered sentence; that is deliberate —
 * the contract is a build artifact and must not change shape per build locale.
 */
export const UNAUTHORIZED_ERRORS = {
  ACCESS_TOKEN_REQUIRED: 'errors.auth.access_token_required',
  REFRESH_TOKEN_REQUIRED: 'errors.auth.refresh_token_required',
  INVALID_TOKEN_REQUIREMENT: 'errors.auth.invalid_token_requirement',
  INVALID_OR_EXPIRED_TOKEN: 'errors.auth.invalid_or_expired_token',
  USER_NOT_FOUND: 'errors.auth.user_not_found',
  SESSION_NOT_FOUND: 'errors.auth.session_not_found',
} as const

/** Defines the auth error type. */
export type AuthErrorType = (typeof UNAUTHORIZED_ERRORS)[keyof typeof UNAUTHORIZED_ERRORS]
