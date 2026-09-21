import { paginationQuerySchema } from '@common/pagination'
import { adminResourceStatusSchema } from '@modules/admin/shared'
import { createZodDto } from 'nestjs-zod'

/** Query for an artist's published albums — newest first, take-down status filterable. */
export const ListArtistAlbumsQuerySchema = paginationQuerySchema.extend({
  status: adminResourceStatusSchema.optional(),
})

export class ListArtistAlbumsQueryDto extends createZodDto(ListArtistAlbumsQuerySchema) {}
