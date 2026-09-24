/**
 * Message keys the `HttpExceptionFilter` translates — never literal English. See the mirror
 * comment in `modules/users-auth/errors/unauthorized.errors.ts` for why Swagger still reads
 * the key rather than the rendered sentence.
 */
export const UNAUTHORIZED_ERRORS = {
  ACCESS_TOKEN_REQUIRED: 'errors.auth.access_token_required',
  REFRESH_TOKEN_REQUIRED: 'errors.auth.refresh_token_required',
  INVALID_TOKEN_REQUIREMENT: 'errors.auth.invalid_token_requirement',
  INVALID_OR_EXPIRED_TOKEN: 'errors.auth.invalid_or_expired_token',
  USER_NOT_FOUND: 'errors.auth.user_not_found',
  SESSION_NOT_FOUND: 'errors.auth.session_not_found',
} as const
