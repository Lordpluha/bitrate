import { paginationQuerySchema } from '@common/pagination'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

/** Statuses a submission can reach; `ALL` covers every one of them. */
export const ADMIN_REVIEWED_STATUSES = [
  'SUBMITTED',
  'READY',
  'REJECTED',
  'PUBLISHING',
  'PUBLISH_FAILED',
  'RELEASED',
] as const

/** The review queue shows submissions by default. */
export const ADMIN_RELEASE_STATUSES = [...ADMIN_REVIEWED_STATUSES, 'ALL'] as const

export const ListAdminReleasesQuerySchema = paginationQuerySchema
  .extend({
    status: z.enum(ADMIN_RELEASE_STATUSES).default('SUBMITTED'),
    q: z.string().trim().min(1).max(100).optional().describe('Title or artist handle'),
  })
  .strict()

const expectedUpdatedAt = z.iso
  .datetime({ offset: true })
  .describe('Release version the reviewer looked at')

/** Longest review feedback, in characters of Markdown source. */
const REVIEW_MESSAGE_MAX_LENGTH = 5000

/**
 * Review feedback is Markdown: bold, italics, lists, quotes, code and links. Clients render it
 * without raw HTML, so the text can only carry formatting.
 */
const feedback = z.string().trim().min(1).max(REVIEW_MESSAGE_MAX_LENGTH)

export const ApproveReleaseSchema = z.strictObject({
  message: feedback.optional().describe('Optional note to the artist, in Markdown'),
  expectedUpdatedAt,
})

export const RequestReleaseChangesSchema = z.strictObject({
  message: feedback.describe('What the artist must change before resubmitting, in Markdown'),
  expectedUpdatedAt,
})

export class ListAdminReleasesQueryDto extends createZodDto(ListAdminReleasesQuerySchema) {}
export class ApproveReleaseDto extends createZodDto(ApproveReleaseSchema) {}
export class RequestReleaseChangesDto extends createZodDto(RequestReleaseChangesSchema) {}
