import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const CreateSupportConversationSchema = z.object({
  /** `listener` from web-player, `artist` from web-artists. */
  audience: z.enum(['listener', 'artist']),
  /** Defaults to the request's language (`Accept-Language`). */
  locale: z.enum(['en', 'uk', 'pl']).optional(),
})

export class CreateSupportConversationDto extends createZodDto(CreateSupportConversationSchema) {}
