import type { Citation, Locale } from '@bitrate/support-core'

/**
 * The support assistant's Telegram channel (#574). The webhook only enqueues; the API process
 * runs the turn and sends the reply. Operator replies from the admin process join the same queue.
 */
export const SUPPORT_TELEGRAM_QUEUE = 'support-telegram'

/** One incoming message: runs the turn once (a retry is only safe before it starts). */
export const SUPPORT_TELEGRAM_UPDATE_JOB = 'update'

/** One outgoing message, rendered for Telegram on send; safe to retry. */
export const SUPPORT_TELEGRAM_SEND_JOB = 'send'

export interface TelegramUpdateJob {
  updateId: number
  chatId: string
  text: string
  languageCode?: string
}

export interface TelegramSendJob {
  chatId: string
  /** Markdown, as the assistant or the operator wrote it. */
  text: string
  citations: Citation[]
  locale: Locale
}

/** Message text sits in Redis only until the job ends; failures keep a day for diagnosis. */
const KEEP = { removeOnComplete: true, removeOnFail: { age: 24 * 60 * 60 } }

export const TELEGRAM_UPDATE_JOB_OPTIONS = {
  ...KEEP,
  attempts: 3,
  backoff: { type: 'exponential', delay: 2_000 },
}

export const TELEGRAM_SEND_JOB_OPTIONS = {
  ...KEEP,
  attempts: 5,
  backoff: { type: 'exponential', delay: 5_000 },
}
