import { z } from 'zod'
import { arrayOrPaginated } from '@/shared/api/paginated'

export const safeUserResponseSchema = z.object({
  avatar: z.string().nullable(),
  createdAt: z.string(),
  deletedAt: z.string().nullable(),
  description: z.string().nullable(),
  email: z.string(),
  emailVerifiedAt: z.string().nullable(),
  failedLoginAttempts: z.number(),
  id: z.string(),
  lockedUntil: z.string().nullable(),
  twoFactorEnabled: z.boolean(),
  updatedAt: z.string(),
  username: z.string(),
})

export const safeUsersResponseSchema = arrayOrPaginated(safeUserResponseSchema)

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
