/** Message keys the `HttpExceptionFilter` translates — never literal English. */
export const PROMOTION_ERRORS = {
  PROFILE_REQUIRED: 'errors.promotion.profile_required',
  RELEASE_DATE_REQUIRED: 'errors.promotion.release_date_required',
  PLAN_GENERATING: 'errors.promotion.plan_generating',
  PLAN_NOT_FOUND: 'errors.promotion.plan_not_found',
  PLAN_NOT_LATEST: 'errors.promotion.plan_not_latest',
  STEP_NOT_FOUND: 'errors.promotion.step_not_found',
  STEP_CHANGED: 'errors.promotion.step_changed',
  STEP_REGENERATING: 'errors.promotion.step_regenerating',
  DISABLED: 'errors.promotion.disabled',
  /** Stored on a FAILED plan: no model could produce a plan. */
  GENERATION_UNAVAILABLE: 'errors.promotion.generation_unavailable',
  /** Stored on a FAILED plan: the output failed its checks twice. */
  GENERATION_REJECTED: 'errors.promotion.generation_rejected',
  /** Stored on a FAILED plan or step: the moderation check refused text the artist wrote. */
  INPUT_REJECTED: 'errors.promotion.input_rejected',
  STEP_NOT_POST: 'errors.promotion.step_not_post',
  STEP_CLOSED: 'errors.promotion.step_closed',
  POSTS_GENERATING: 'errors.promotion.posts_generating',
  POST_NOT_FOUND: 'errors.promotion.post_not_found',
  TRANSLATION_NOT_FOUND: 'errors.promotion.translation_not_found',
  TRANSLATION_BUSY: 'errors.promotion.translation_busy',
} as const

export const PROMOTION_VALIDATION = {
  CONTACT_DETAILS: 'validation.promotion.contact_details',
  DUPLICATE_CHANNELS: 'validation.promotion.duplicate_channels',
  EDIT_EMPTY: 'validation.promotion.edit_empty',
  POST_TOO_LONG: 'validation.promotion.post_too_long',
  CALENDAR_WINDOW: 'validation.promotion.calendar_window',
} as const
