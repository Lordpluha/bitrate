/** Message keys the `HttpExceptionFilter` translates — never literal English. */
export const RELEASE_ERRORS = {
  NOT_FOUND: 'errors.release.not_found',
  CHANGED_OR_NOT_DRAFT: 'errors.release.changed_or_not_draft',
  CHANGED_OR_NOT_SUBMITTED: 'errors.release.changed_or_not_submitted',
  CHANGED_OR_NOT_REJECTED: 'errors.release.changed_or_not_rejected',
  CHANGED_OR_NOT_APPROVED: 'errors.release.changed_or_not_approved',
  NOT_PUBLISH_FAILED: 'errors.release.not_publish_failed',
  CHANGED_OR_NOT_SCHEDULED: 'errors.release.changed_or_not_scheduled',
  CHANGED_OR_NOT_LIVE: 'errors.release.changed_or_not_live',
  CHANGED_OR_NOT_UNPUBLISHED: 'errors.release.changed_or_not_unpublished',
  CREDIT_NOT_FOUND: 'errors.release.credit_not_found',
  CREDITS_NOT_EMPTY: 'errors.release.credits_not_empty',
  RECORDING_NOT_FOUND: 'errors.release.recording_not_found',
  BLOCKERS_UNRESOLVED: 'errors.release.blockers_unresolved',
  SHARE_CONTRIBUTOR_MISMATCH: 'errors.release.share_contributor_mismatch',
  COVER_FILE_REQUIRED: 'errors.release.cover_file_required',
  COVER_TYPE_INVALID: 'errors.release.cover_type_invalid',
  AUDIO_FILE_REQUIRED: 'errors.release.audio_file_required',
  AUDIO_TYPE_INVALID: 'errors.release.audio_type_invalid',
  AUDIO_NOT_FOUND: 'errors.release.audio_not_found',
  TASK_NOT_FOUND: 'errors.release.task_not_found',
  TRACK_ORDER_MISMATCH: 'errors.release.track_order_mismatch',
  TASK_CHANGED: 'errors.release.task_changed',
  TASK_ASSIGNEE_INVALID: 'errors.release.task_assignee_invalid',
} as const

/** Zod issue keys of the release DTOs, translated per request like built-in issues. */
export const RELEASE_VALIDATION = {
  ISRC_INVALID: 'validation.release.isrc_invalid',
  UPDATE_EMPTY: 'validation.release.update_empty',
  COUNTRY_CODE_INVALID: 'validation.release.country_code_invalid',
  DUPLICATE_ITEMS: 'validation.release.duplicate_items',
} as const
