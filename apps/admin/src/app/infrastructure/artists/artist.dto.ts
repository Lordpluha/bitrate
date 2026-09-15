import type { ApiSchemas } from '@bitrate/contracts'
import { z } from 'zod'

/**
 * The slice of the artist entity this panel reads. Naming it as a `Pick` rather than mirroring
 * the whole entity keeps the DTO honest about what the UI depends on, while a renamed or retyped
 * field in the generated contract is still a compile error here.
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

export const artistDto = z.object({
  id: z.uuid(),
  username: z.string(),
  email: z.email(),
  verified: z.boolean(),
  monthlyListeners: z.number().int(),
  country: z.string().nullable(),
  createdAt: z.iso.datetime(),
  deletedAt: z.iso.datetime().nullable(),
}) satisfies z.ZodType<ContractArtist>

export type ArtistDto = z.infer<typeof artistDto>

type ContractArtistPage = Omit<ApiSchemas['PaginatedAdminArtistsEntity'], 'data'> & {
  data: ContractArtist[]
}

export const artistPageDto = z.object({
  data: z.array(artistDto),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
}) satisfies z.ZodType<ContractArtistPage>
