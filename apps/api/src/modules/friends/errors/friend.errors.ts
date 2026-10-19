/** Message keys the `HttpExceptionFilter` translates — never literal English. */
export const FRIEND_ERRORS = {
  SELF: 'errors.friend.self',
  ALREADY_FRIENDS: 'errors.friend.already_friends',
  REQUEST_NOT_FOUND: 'errors.friend.request_not_found',
  USER_NOT_FOUND: 'errors.user.not_found',
} as const
