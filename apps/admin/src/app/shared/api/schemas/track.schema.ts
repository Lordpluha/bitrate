import { z } from 'zod'

const processingStatusSchema = z.enum(['PROCESSING', 'READY', 'FAILED'])

export type TrackProcessingStatus = z.infer<typeof processingStatusSchema>

/** Not exported: consumers need the inferred type and the page envelope, not this. */
const adminTrackSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  artistName: z.string().nullable(),
  processingStatus: processingStatusSchema,
  processingError: z.string().nullable(),
  processingAttempts: z.number().int(),
  processingStartedAt: z.iso.datetime().nullable(),
  processingFinishedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
})

export type AdminTrack = z.infer<typeof adminTrackSchema>

export const adminTrackPageSchema = z.object({
  data: z.array(adminTrackSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
})
