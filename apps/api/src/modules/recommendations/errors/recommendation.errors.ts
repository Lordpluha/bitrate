/** Message keys the `HttpExceptionFilter` translates — never literal English. */
export const RECOMMENDATION_ERRORS = {
  TRACK_NOT_FOUND: 'errors.recommendations.track_not_found',
  ENTITY_NOT_FOUND: 'errors.recommendations.entity_not_found',
  EVENT_OUT_OF_RANGE: 'errors.recommendations.event_out_of_range',
} as const

/** Validation message keys, translated from the locale's validation dictionary. */
export const RECOMMENDATION_VALIDATION = {
  ENDED_BEFORE_START: 'validation.recommendations.ended_before_start',
} as const
