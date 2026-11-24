import { z } from 'zod'

const personSchema = z.object({
  avatar: z.string().nullable(),
  id: z.string(),
  username: z.string(),
})

/**
 * One item of `GET /recommendations/feed`. The contract leaves the response untyped, so it is
 * validated here — the same shape the web player's `recommendationsFeedSchema` accepts.
 */
const feedItemSchema = z.looseObject({
  id: z.string(),
  title: z.string(),
  cover: z.string().nullable(),
  description: z.string().nullable().optional(),
  artistId: z.string().optional(),
  artist: personSchema.optional(),
  userId: z.string().optional(),
  user: personSchema.optional(),
  duration: z.number().nullable().optional(),
})

export const feedSchema = z.object({
  sections: z.array(z.object({ id: z.string(), title: z.string(), items: z.array(feedItemSchema) })),
})

export type FeedItem = z.infer<typeof feedItemSchema>
