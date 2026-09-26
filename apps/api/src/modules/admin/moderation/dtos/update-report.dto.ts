import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { MODERATION_STATUSES } from './list-reports.dto'

export const UpdateReportSchema = z.object({
  status: z.enum(MODERATION_STATUSES),
})

export class UpdateReportDto extends createZodDto(UpdateReportSchema) {}
