export const UNAUTHORIZED_ERRORS = {
  ACCESS_TOKEN_REQUIRED: 'Access token required',
  REFRESH_TOKEN_REQUIRED: 'Refresh token required',
  INVALID_TOKEN_REQUIREMENT: 'Invalid token requirement',
  INVALID_OR_EXPIRED_TOKEN: 'Invalid or expired token',
  USER_NOT_FOUND: 'User not found',
  SESSION_NOT_FOUND: 'Session not found'
} as const

export type AuthErrorType =
  (typeof UNAUTHORIZED_ERRORS)[keyof typeof UNAUTHORIZED_ERRORS]
