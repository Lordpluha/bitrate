import { paginationQuerySchema } from '@common/pagination'
import { RELEASE_VALIDATION } from '@modules/releases/errors'
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

const note = z.string().trim().min(1).max(500)
const message = z
  .string()
  .trim()
  .min(1)
  .max(2000)
  .optional()
  .describe('Optional note to the artist')

/** Review items are shown as a list; each one must say something different. */
const noteList = (min: number, max: number) =>
  z
    .array(note)
    .min(min)
    .max(max)
    .refine((items) => new Set(items).size === items.length, RELEASE_VALIDATION.DUPLICATE_ITEMS)

export const ApproveReleaseSchema = z.strictObject({
  message,
  expectedUpdatedAt,
})

export const RequestReleaseChangesSchema = z.strictObject({
  requiredChanges: noteList(1, 20).describe('Changes the artist must make before resubmitting'),
  recommendations: noteList(0, 20).default([]).describe('Optional suggestions'),
  message,
  expectedUpdatedAt,
})

export class ListAdminReleasesQueryDto extends createZodDto(ListAdminReleasesQuerySchema) {}
export class ApproveReleaseDto extends createZodDto(ApproveReleaseSchema) {}
export class RequestReleaseChangesDto extends createZodDto(RequestReleaseChangesSchema) {}
