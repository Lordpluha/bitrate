import { z } from 'zod'

/** The create playlist schema value. */
export const CreatePlaylistSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  isPublic: z.boolean().optional().default(false),
})

/** Defines the create playlist dto. */
export type CreatePlaylistDto = {
  title: string
  description?: string
  isPublic?: boolean
}
