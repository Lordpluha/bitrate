import { z } from 'zod'

export const adminArtistSchema = z.object({
  id: z.uuid(),
  username: z.string(),
  email: z.email(),
  verified: z.boolean(),
  monthlyListeners: z.number().int(),
  country: z.string().nullable(),
  createdAt: z.iso.datetime(),
  deletedAt: z.iso.datetime().nullable(),
})

export type AdminArtist = z.infer<typeof adminArtistSchema>

export const adminArtistPageSchema = z.object({
  data: z.array(adminArtistSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
})
