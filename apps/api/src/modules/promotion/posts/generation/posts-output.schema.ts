import { z } from 'zod'
import { PROMOTION_VALIDATION } from '../../promotion.errors'
import { CHANNEL_FORMATS } from './channel-formats'

const CHANNELS = ['INSTAGRAM', 'TIKTOK', 'TELEGRAM', 'YOUTUBE_SHORTS'] as const

/** One English master per channel; a draft over its channel's limit is a rejected attempt. */
export const PostsOutputSchema = z.object({
  posts: z
    .array(
      z
        .object({
          channel: z.enum(CHANNELS),
          text: z.string().min(1),
          hashtags: z.array(z.string().regex(/^#[\p{L}\p{N}_]{1,40}$/u)).max(8),
        })
        .refine((post) => post.text.length <= CHANNEL_FORMATS[post.channel].maxLength, {
          message: PROMOTION_VALIDATION.POST_TOO_LONG,
        }),
    )
    .min(1)
    .max(CHANNELS.length),
})
export type PostsOutput = z.infer<typeof PostsOutputSchema>
