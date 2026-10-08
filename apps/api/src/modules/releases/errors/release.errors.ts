/** Message keys the `HttpExceptionFilter` translates — never literal English. */
export const RELEASE_ERRORS = {
  NOT_FOUND: 'errors.release.not_found',
  CHANGED_OR_NOT_DRAFT: 'errors.release.changed_or_not_draft',
  CHANGED_OR_NOT_SUBMITTED: 'errors.release.changed_or_not_submitted',
  CREDIT_NOT_FOUND: 'errors.release.credit_not_found',
  RECORDING_NOT_FOUND: 'errors.release.recording_not_found',
  BLOCKERS_UNRESOLVED: 'errors.release.blockers_unresolved',
  SHARE_CONTRIBUTOR_MISMATCH: 'errors.release.share_contributor_mismatch',
} as const

/** Zod issue keys of the release DTOs, translated per request like built-in issues. */
export const RELEASE_VALIDATION = {
  ISRC_INVALID: 'validation.release.isrc_invalid',
  UPDATE_EMPTY: 'validation.release.update_empty',
} as const
