/** Message keys the `HttpExceptionFilter` translates — never literal English. */
export const SUPPORT_ERRORS = {
  /** Missing, or not this caller's: the two are indistinguishable on purpose. */
  CONVERSATION_NOT_FOUND: 'errors.support.conversation_not_found',
  TURN_IN_PROGRESS: 'errors.support.turn_in_progress',
} as const
