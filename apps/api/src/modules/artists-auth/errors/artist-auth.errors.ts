/** Message keys the `HttpExceptionFilter` translates — never literal English. */
export const ARTIST_AUTH_ERRORS = {
  EMAIL_VERIFICATION_UNAVAILABLE: 'errors.artist_auth.email_verification_unavailable',
  INVALID_VERIFICATION_CODE: 'errors.artist_auth.invalid_verification_code',
  VERIFICATION_CODE_COOLDOWN: 'errors.artist_auth.verification_code_cooldown',
  SESSION_NOT_FOUND: 'errors.artist_auth.session_not_found',
  SESSION_IS_CURRENT: 'errors.artist_auth.session_is_current',
} as const
