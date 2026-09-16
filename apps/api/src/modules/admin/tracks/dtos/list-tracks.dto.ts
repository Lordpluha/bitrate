import { paginationQuerySchema } from '@common/pagination'
import { sortQuerySchema } from '@common/sort'
import type { Prisma } from '@prisma/client'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const TRACK_PROCESSING_STATUSES = ['PROCESSING', 'READY', 'FAILED'] as const

/** Choosing a sort here replaces the attention-first default (see `AdminTracksService`) with
 * a plain ordering — these three are what the catalog screen displays and are cheap columns
 * to order by. */
export const ADMIN_TRACKS_SORT_FIELDS = [
  'createdAt',
  'title',
  'processingStatus',
] as const satisfies readonly Prisma.TrackScalarFieldEnum[]

export const ListAdminTracksQuerySchema = paginationQuerySchema
  .merge(sortQuerySchema(ADMIN_TRACKS_SORT_FIELDS))
  .extend({
    processingStatus: z.enum(TRACK_PROCESSING_STATUSES).optional(),
    q: z.string().min(1).max(255).optional(),
  })

export class ListAdminTracksQueryDto extends createZodDto(ListAdminTracksQuerySchema) {}
