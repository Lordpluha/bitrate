import { MAX_SUPPORT_REPLY_CHARS } from '@domain/support'
import * as z from 'zod'

/** Messages are transloco keys; the page translates them on show. */
export const supportReplySchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, 'supportConversation.invalid.textRequired')
    .max(MAX_SUPPORT_REPLY_CHARS, 'supportConversation.invalid.textTooLong'),
})
