import { paginationQuerySchema } from '@common/pagination'
import { sortQuerySchema } from '@common/sort'
import type { Prisma } from '@prisma/client'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const MODERATION_STATUSES = ['OPEN', 'REVIEWING', 'RESOLVED', 'REJECTED'] as const

/** `status` is already indexed alongside `createdAt` (`@@index([status, createdAt])`), so
 * both are cheap; `status` also lets an operator group by outcome instead of only filtering
 * to one at a time. */
export const ADMIN_REPORTS_SORT_FIELDS = [
  'createdAt',
  'status',
] as const satisfies readonly Prisma.ModerationReportScalarFieldEnum[]

export const ListReportsQuerySchema = paginationQuerySchema
  .merge(sortQuerySchema(ADMIN_REPORTS_SORT_FIELDS))
  .extend({
    status: z.enum(MODERATION_STATUSES).optional(),
  })

export class ListReportsQueryDto extends createZodDto(ListReportsQuerySchema) {}
