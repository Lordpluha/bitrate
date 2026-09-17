import { paginationQuerySchema } from '@common/pagination'
import { createZodDto } from 'nestjs-zod'

/** A track's processing attempt history has one meaningful order — newest first — so this
 * query carries pagination only, no filters or sort. */
export const ListProcessingAttemptsQuerySchema = paginationQuerySchema

export class ListProcessingAttemptsQueryDto extends createZodDto(
  ListProcessingAttemptsQuerySchema,
) {}
