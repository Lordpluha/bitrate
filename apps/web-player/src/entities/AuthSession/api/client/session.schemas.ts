import { z } from 'zod'

export const authSessionSchema = z.object({
  createdAt: z.string(),
  current: z.boolean(),
  expiresAt: z.string().nullable(),
  id: z.string(),
})

export const authSessionsSchema = z.array(authSessionSchema)

export type AuthSession = z.infer<typeof authSessionSchema>
