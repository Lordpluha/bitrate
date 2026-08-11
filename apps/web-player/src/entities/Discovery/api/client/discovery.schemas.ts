import { z } from 'zod'

const paginationSchema = z.object({
  limit: z.number(),
  page: z.number(),
  total: z.number(),
})

export const browseCategorySchema = z.object({
  _count: z.object({
    albums: z.number(),
    artists: z.number(),
    tracks: z.number(),
  }),
  color: z.string().nullable(),
  cover: z.string().nullable(),
  description: z.string().nullable(),
  id: z.string(),
  name: z.string(),
  slug: z.string(),
})

export const browseCategoriesSchema = paginationSchema.extend({
  data: z.array(browseCategorySchema),
})

export const discoveryPlaylistSchema = z.object({
  _count: z.object({ tracks: z.number() }).optional(),
  cover: z.string().nullable(),
  description: z.string().nullable(),
  id: z.string(),
  title: z.string(),
  user: z
    .object({
      avatar: z.string().nullable(),
      id: z.string(),
      username: z.string(),
    })
    .optional(),
  userId: z.string(),
})

export const categoryPlaylistsSchema = paginationSchema.extend({
  data: z.array(discoveryPlaylistSchema),
})

export const discoveryTrackSchema = z.object({
  artist: z
    .object({
      avatar: z.string().nullable(),
      id: z.string(),
      username: z.string(),
    })
    .optional(),
  artistId: z.string(),
  cover: z.string().nullable(),
  duration: z.number().nullable().optional(),
  id: z.string(),
  title: z.string(),
})

export const chartsSchema = paginationSchema.extend({
  data: z.array(discoveryTrackSchema),
})

export const discoveryFeedItemSchema = z
  .object({
    artist: z
      .object({
        avatar: z.string().nullable(),
        id: z.string(),
        username: z.string(),
      })
      .optional(),
    artistId: z.string().optional(),
    cover: z.string().nullable(),
    description: z.string().nullable().optional(),
    id: z.string(),
    title: z.string(),
    user: z
      .object({
        avatar: z.string().nullable(),
        id: z.string(),
        username: z.string(),
      })
      .optional(),
    userId: z.string().optional(),
  })
  .passthrough()

export const recommendationsFeedSchema = z.object({
  sections: z.array(
    z.object({
      id: z.string(),
      items: z.array(discoveryFeedItemSchema),
      title: z.string(),
    }),
  ),
})

export const topTracksSchema = paginationSchema.extend({
  data: z.array(discoveryTrackSchema.extend({ plays: z.number() })),
})

export const topArtistSchema = z.object({
  avatar: z.string().nullable(),
  backgroundImage: z.string().nullable().optional(),
  bio: z.string().nullable(),
  id: z.string(),
  plays: z.number(),
  username: z.string(),
})

export const topArtistsSchema = paginationSchema.extend({
  data: z.array(topArtistSchema),
})

export type BrowseCategoryResponse = z.infer<typeof browseCategorySchema>
export type DiscoveryFeedItem = z.infer<typeof discoveryFeedItemSchema>
export type DiscoveryPlaylist = z.infer<typeof discoveryPlaylistSchema>
export type DiscoveryTrack = z.infer<typeof discoveryTrackSchema>
export type TopArtist = z.infer<typeof topArtistSchema>
