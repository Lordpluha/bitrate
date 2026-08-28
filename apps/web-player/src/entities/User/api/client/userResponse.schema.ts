import { z } from 'zod'
import { arrayOrPaginated } from '@/shared/api/paginated'

export const publicUserResponseSchema = z.object({
  avatar: z.string().nullable(),
  createdAt: z.string(),
  description: z.string().nullable(),
  id: z.string(),
  updatedAt: z.string(),
  username: z.string(),
})

export const publicUsersResponseSchema = arrayOrPaginated(
  publicUserResponseSchema,
)

export const followedUsersResponseSchema = z.object({
  data: z.array(
    z.object({
      avatar: z.string().nullable(),
      description: z.string().nullable(),
      followedAt: z.string(),
      id: z.string(),
      username: z.string(),
    }),
  ),
  limit: z.number(),
  page: z.number(),
  total: z.number(),
})

export type FollowedUser = z.infer<
  typeof followedUsersResponseSchema
>['data'][number]

export type PublicUser = z.infer<typeof publicUserResponseSchema>
