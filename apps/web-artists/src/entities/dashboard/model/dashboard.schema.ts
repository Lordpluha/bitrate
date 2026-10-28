import type { ApiSchemas } from '@bitrate/contracts'
import { releaseStatuses } from '@shared/constants/releaseStatuses'
import { z } from 'zod'

const instant = z.iso.datetime({ offset: true })
const releaseStatus = z.enum(releaseStatuses)

/** The API still reports release tasks, which the workspace no longer shows. */
const withoutTaskAttention = (items: unknown) =>
  Array.isArray(items)
    ? items.filter(
        (item: unknown) =>
          !(
            typeof item === 'object' &&
            item !== null &&
            'kind' in item &&
            item.kind === 'OVERDUE_TASKS'
          ),
      )
    : items

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
      leadTrack: z
        .object({
          id: z.uuid(),
          title: z.string(),
          duration: z.number().int().nonnegative().nullable(),
          waveform: z.array(z.number().min(0).max(1)).max(400),
        })
        .nullable()
        .default(null),
    })
    .nullable(),
  attention: z.preprocess(
    withoutTaskAttention,
    z.array(
      z.object({
        kind: z.enum(['BLOCKERS', 'CHANGES_REQUESTED']),
        releaseId: z.uuid().optional(),
        releaseTitle: z.string().optional(),
        count: z.number().int().positive().optional(),
      }),
    ),
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
}) satisfies z.ZodType<Omit<ApiSchemas['ArtistDashboardEntity'], 'tasks'>>

export type ArtistDashboard = z.infer<typeof artistDashboardSchema>
export type DashboardAttention = ArtistDashboard['attention'][number]
