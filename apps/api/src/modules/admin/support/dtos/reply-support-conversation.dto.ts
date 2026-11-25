import { MAX_SUPPORT_MESSAGE_CHARS } from '@modules/support/chat/support-limits'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const ReplySupportConversationSchema = z.object({
  text: z.string().trim().min(1).max(MAX_SUPPORT_MESSAGE_CHARS),
})

export class ReplySupportConversationDto extends createZodDto(ReplySupportConversationSchema) {}
