import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { MAX_SUPPORT_MESSAGE_CHARS } from '../support-limits'

export const SendSupportMessageSchema = z.object({
  text: z.string().trim().min(1).max(MAX_SUPPORT_MESSAGE_CHARS),
})

export class SendSupportMessageDto extends createZodDto(SendSupportMessageSchema) {}
