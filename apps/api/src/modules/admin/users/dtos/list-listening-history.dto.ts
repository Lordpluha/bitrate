import { paginationQuerySchema } from '@common/pagination'
import { createZodDto } from 'nestjs-zod'

/** A user's listening history has one meaningful order — newest first — so this query carries
 * pagination only, no filters or sort, matching `ListProcessingAttemptsQuerySchema`'s reasoning. */
export const ListListeningHistoryQuerySchema = paginationQuerySchema

export class ListListeningHistoryQueryDto extends createZodDto(ListListeningHistoryQuerySchema) {}
