import type { ApiSchemas } from '@bitrate/contracts'
import { z } from 'zod'

const instant = z.iso.datetime({ offset: true })
const releaseStatus = z.enum([
  'DRAFT',
  'READY',
  'SUBMITTED',
  'RELEASED',
  'REJECTED',
])

export const artistDashboardSchema = z.object({
  counts: z.object({
    releases: z.number().int().nonnegative(),
    drafts: z.number().int().nonnegative(),
    inReview: z.number().int().nonnegative(),
    released: z.number().int().nonnegative(),
    tracks: z.number().int().nonnegative(),
  }),
  currentRelease: z
    .object({
      id: z.uuid(),
      title: z.string(),
      type: z.enum(['SINGLE', 'EP', 'ALBUM', 'COMPILATION']),
      status: releaseStatus,
      cover: z.string().nullable(),
      scheduledAt: instant.nullable(),
      updatedAt: instant,
      blockerCount: z.number().int().nonnegative(),
    })
    .nullable(),
  attention: z.array(
    z.object({
      kind: z.enum(['BLOCKERS', 'CHANGES_REQUESTED', 'OVERDUE_TASKS']),
      releaseId: z.uuid().optional(),
      releaseTitle: z.string().optional(),
      count: z.number().int().positive().optional(),
    }),
  ),
  upcoming: z
    .array(
      z.object({
        id: z.uuid(),
        title: z.string(),
        status: releaseStatus,
        scheduledAt: instant,
      }),
    )
    .max(5),
  tasks: z.object({
    open: z.number().int().nonnegative(),
    overdue: z.number().int().nonnegative(),
    next: z
      .array(
        z.object({
          id: z.uuid(),
          title: z.string(),
          status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']),
          dueAt: instant.nullable(),
          release: z.object({ id: z.uuid(), title: z.string() }),
        }),
      )
      .max(5),
  }),
}) satisfies z.ZodType<ApiSchemas['ArtistDashboardEntity']>

export type ArtistDashboard = z.infer<typeof artistDashboardSchema>
export type DashboardAttention = ArtistDashboard['attention'][number]
