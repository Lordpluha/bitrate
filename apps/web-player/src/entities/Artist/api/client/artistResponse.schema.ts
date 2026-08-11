import { z } from 'zod'

export const artistResponseSchema = z.object({
  id: z.string(),
  username: z.string(),
  bio: z.string().nullable().default(null),
  avatar: z.string().nullable().default(null),
  backgroundImage: z.string().nullable().default(null),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export const artistsResponseSchema = z
  .union([
    z.array(artistResponseSchema),
    z.object({ data: z.array(artistResponseSchema) }),
  ])
  .transform((value) => (Array.isArray(value) ? value : value.data))
