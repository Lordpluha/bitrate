import type { TelegramUpdateJob } from '@infra/queues/support-telegram.queue'
import { z } from 'zod'

/** The part of a Telegram `Update` the bot reads; everything else is ignored. */
const updateSchema = z.object({
  update_id: z.number().int(),
  message: z
    .object({
      chat: z.object({ id: z.number().int(), type: z.string() }),
      from: z.object({ language_code: z.string().optional() }).optional(),
      text: z.string().optional(),
    })
    .optional(),
})

/**
 * The private text message an update carries, or `null` for what the bot does not answer:
 * groups and channels, edits, media and service updates.
 */
export function parseTelegramUpdate(body: unknown): TelegramUpdateJob | null {
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return null
  const message = parsed.data.message
  if (message?.chat.type !== 'private' || !message.text?.trim()) return null
  const languageCode = message.from?.language_code
  return {
    updateId: parsed.data.update_id,
    chatId: String(message.chat.id),
    text: message.text,
    ...(languageCode ? { languageCode } : {}),
  }
}
