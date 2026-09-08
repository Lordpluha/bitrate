import { z } from 'zod'

/** Not exported: consumers need the inferred type and the page envelope, not this. */
const adminUserSchema = z.object({
  id: z.uuid(),
  username: z.string(),
  email: z.email(),
  emailVerifiedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  deletedAt: z.iso.datetime().nullable(),
})

export type AdminUser = z.infer<typeof adminUserSchema>

export const adminUserPageSchema = z.object({
  data: z.array(adminUserSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
})
