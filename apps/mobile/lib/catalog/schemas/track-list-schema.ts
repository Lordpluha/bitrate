import { z } from 'zod'

/** The fields every track payload carries, whatever endpoint it came from. */
const trackSummarySchema = z.looseObject({
  id: z.string(),
  title: z.string(),
  cover: z.string().nullable(),
  duration: z.number().nullable().optional(),
  artistId: z.string().nullable().optional(),
  artist: z.object({ username: z.string() }).nullable().optional(),
})

/** Untyped track lists (`/tracks/liked`, album tracks) come as an array or `{ data: [] }`. */
export const trackListSchema = z.union([
  z.array(trackSummarySchema),
  z.object({ data: z.array(trackSummarySchema) }).transform(({ data }) => data),
])

export const albumWithTracksSchema = z.looseObject({
  id: z.string(),
  title: z.string(),
  cover: z.string().nullable(),
  tracks: z.array(trackSummarySchema).optional(),
})

export type TrackSummary = z.infer<typeof trackSummarySchema>
