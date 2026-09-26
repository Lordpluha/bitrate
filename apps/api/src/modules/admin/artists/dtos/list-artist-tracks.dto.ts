import { paginationQuerySchema } from '@common/pagination'
import { adminResourceStatusSchema } from '@modules/admin/shared'
import { createZodDto } from 'nestjs-zod'

/** Query for an artist's published tracks — newest first, take-down status filterable. */
export const ListArtistTracksQuerySchema = paginationQuerySchema.extend({
  status: adminResourceStatusSchema.optional(),
})

export class ListArtistTracksQueryDto extends createZodDto(ListArtistTracksQuerySchema) {}
