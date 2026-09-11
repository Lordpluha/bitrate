import type { ApiSchemas } from '@bitrate/contracts'
import { z } from 'zod'

/**
 * The slice of the artist entity this panel reads. Naming it as a `Pick` rather than mirroring
 * the whole entity keeps the schema honest about what the UI depends on, while still making a
 * renamed or retyped field in the generated contract a compile error here.
 */
type ContractArtist = Pick<
  ApiSchemas['AdminArtistEntity'],
  | 'id'
  | 'username'
  | 'email'
  | 'verified'
  | 'monthlyListeners'
  | 'country'
  | 'createdAt'
  | 'deletedAt'
>

export const adminArtistSchema = z.object({
  id: z.uuid(),
  username: z.string(),
  email: z.email(),
  verified: z.boolean(),
  monthlyListeners: z.number().int(),
  country: z.string().nullable(),
  createdAt: z.iso.datetime(),
  deletedAt: z.iso.datetime().nullable(),
}) satisfies z.ZodType<ContractArtist>

export type AdminArtist = z.infer<typeof adminArtistSchema>

type ContractArtistPage = Omit<ApiSchemas['PaginatedAdminArtistsEntity'], 'data'> & {
  data: ContractArtist[]
}

export const adminArtistPageSchema = z.object({
  data: z.array(adminArtistSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
}) satisfies z.ZodType<ContractArtistPage>
