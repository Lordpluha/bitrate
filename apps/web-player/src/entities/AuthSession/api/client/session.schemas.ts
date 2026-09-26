import { z } from 'zod'

const authSessionSchema = z.object({
  createdAt: z.string(),
  current: z.boolean(),
  expiresAt: z.string().nullable(),
  id: z.string(),
})

export const authSessionsSchema = z.array(authSessionSchema)
