import { z } from 'zod'

export const safeUserResponseSchema = z.object({
  avatar: z.string().nullable(),
  createdAt: z.string(),
  description: z.string().nullable(),
  email: z.string(),
  id: z.string(),
  twoFactorEnabled: z.boolean(),
  updatedAt: z.string(),
  username: z.string(),
})

export const safeUsersResponseSchema = z.array(safeUserResponseSchema)
