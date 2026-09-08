/** The unauthorized errors value. */
export const UNAUTHORIZED_ERRORS = {
  ACCESS_TOKEN_REQUIRED: 'Access token required',
  REFRESH_TOKEN_REQUIRED: 'Refresh token required',
  INVALID_TOKEN_REQUIREMENT: 'Invalid token requirement',
  INVALID_OR_EXPIRED_TOKEN: 'Invalid or expired token',
  STAFF_NOT_FOUND: 'Staff not found',
  SESSION_NOT_FOUND: 'Session not found',
} as const

/** Defines the auth error type. */
export type AuthErrorType = (typeof UNAUTHORIZED_ERRORS)[keyof typeof UNAUTHORIZED_ERRORS]
