import type { TranslationKey } from '@/lib/i18n/messages/en'

import { ApiRequestError } from './api-request-error'

type ErrorMessageKeyInput = {
  error: unknown
  /** The screen's own message for any other failure. */
  fallback: TranslationKey
  /** Screen-specific meaning of particular statuses (e.g. 401 → wrong credentials). */
  byStatus?: Partial<Record<number, TranslationKey>>
}

/**
 * Picks the message for a failed request: the screen's status overrides first, then rate
 * limiting, then "no connection" (fetch rejects with a TypeError), else the fallback.
 */
export function errorMessageKey({ error, fallback, byStatus = {} }: ErrorMessageKeyInput): TranslationKey {
  if (error instanceof ApiRequestError) {
    return byStatus[error.status] ?? (error.status === 429 ? 'common.error.rateLimited' : fallback)
  }
  if (error instanceof TypeError) return 'common.error.network'
  return fallback
}
