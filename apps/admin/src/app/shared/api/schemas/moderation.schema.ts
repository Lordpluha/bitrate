import { z } from 'zod'

/** Not exported: only the inferred type is part of this module surface. */
const moderationStatusSchema = z.enum(['OPEN', 'REVIEWING', 'RESOLVED', 'REJECTED'])

export type ModerationStatus = z.infer<typeof moderationStatusSchema>

export const moderationReportSchema = z.object({
  id: z.uuid(),
  reporterId: z.uuid(),
  entityType: z.string(),
  entityId: z.uuid(),
  reason: z.string(),
  details: z.string().nullable(),
  status: moderationStatusSchema,
  resolvedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
})

export type ModerationReport = z.infer<typeof moderationReportSchema>

export const moderationReportPageSchema = z.object({
  data: z.array(moderationReportSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
})

export type ModerationReportPage = z.infer<typeof moderationReportPageSchema>
