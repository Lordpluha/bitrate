import type { ApiSchemas } from '@bitrate/contracts'
import { z } from 'zod'

export const trackStatuses = [
  'DRAFT',
  'PROCESSING',
  'READY',
  'NEEDS_CHANGES',
  'PUBLISHED',
  'UPLOAD_FAILED',
] as const
export const trackVersions = ['ORIGINAL', 'REMASTER', 'LIVE', 'DEMO'] as const
export const trackStatusLabels = {
  DRAFT: 'Draft',
  PROCESSING: 'Processing',
  READY: 'Ready',
  NEEDS_CHANGES: 'Needs changes',
  PUBLISHED: 'Published',
  UPLOAD_FAILED: 'Upload failed',
} satisfies Record<ApiSchemas['ArtistTrackStatus'], string>
export const trackVersionLabels = {
  ORIGINAL: 'Original',
  REMASTER: 'Remaster',
  LIVE: 'Live',
  DEMO: 'Demo',
} satisfies Record<ApiSchemas['ArtistTrackVersion'], string>

export const catalogueSearchSchema = z.object({
  tab: z.enum(['tracks', 'releases']).optional().catch(undefined),
  page: z.coerce.number().int().min(1).optional().catch(undefined),
  q: z.string().max(100).optional().catch(undefined),
  status: z.string().optional().catch(undefined),
  type: z.string().optional().catch(undefined),
  sort: z.enum(['updated', 'title', 'oldest']).optional().catch(undefined),
  created: z.uuid().optional().catch(undefined),
})
export type CatalogueSearch = z.infer<typeof catalogueSearchSchema>
export type MusicTrack = ApiSchemas['MusicTrackEntity']
export type MusicRelease = ApiSchemas['MusicReleaseEntity']

const optionalMedia = z
  .string()
  .refine((value) => {
    if (value.startsWith('/') && !value.startsWith('//')) return true
    try {
      return ['https:', 'http:'].includes(new URL(value).protocol)
    } catch {
      return false
    }
  }, 'Invalid media URL')
  .nullable()
const musicTrackSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  artistName: z.string(),
  version: z.enum(trackVersions),
  status: z.enum(trackStatuses),
  duration: z.number().int().nonnegative().nullable(),
  cover: optionalMedia,
  previewUrl: optionalMedia,
  isDemo: z.boolean(),
  updatedAt: z.iso.datetime({ offset: true }),
  release: z.object({ id: z.uuid(), title: z.string() }).nullable(),
}) satisfies z.ZodType<MusicTrack>

const musicReleaseSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  artistName: z.string(),
  type: z.enum(['SINGLE', 'EP', 'ALBUM', 'COMPILATION']),
  status: z.enum(['DRAFT', 'READY', 'SUBMITTED', 'RELEASED', 'REJECTED']),
  cover: optionalMedia,
  isDemo: z.boolean(),
  trackCount: z.number().int().nonnegative(),
  upc: z.string().nullable(),
  scheduledAt: z.iso.datetime({ offset: true }).nullable(),
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
}) satisfies z.ZodType<MusicRelease>
const pagination = {
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().min(1).max(100),
}
export const musicTrackPageSchema = z.object({
  data: z.array(musicTrackSchema),
  ...pagination,
})
export const musicReleasePageSchema = z.object({
  data: z.array(musicReleaseSchema),
  ...pagination,
})
export const musicCountsSchema = z.object({
  tracks: z.number().int().nonnegative(),
  releases: z.number().int().nonnegative(),
})
