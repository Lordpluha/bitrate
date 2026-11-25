import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

const POST_ACTIONS = ['copied', 'exported'] as const

export const PostActionSchema = z.strictObject({
  action: z.enum(POST_ACTIONS).describe('Copied to the clipboard, or downloaded as text'),
})
export class PostActionDto extends createZodDto(PostActionSchema) {}
export type PostAction = z.infer<typeof PostActionSchema>['action']
