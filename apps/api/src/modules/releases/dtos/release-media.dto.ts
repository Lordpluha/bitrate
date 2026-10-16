import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { RELEASE_VALIDATION } from '../errors'

const expectedUpdatedAt = z.iso
  .datetime({ offset: true })
  .describe('Release version read before editing')

/** Text fields sent with the `cover` file part. */
export const UploadReleaseCoverSchema = z.strictObject({ expectedUpdatedAt })

/** Text fields sent with the `audio` file part; the title defaults to the file name client-side. */
export const UploadReleaseTrackSchema = z.strictObject({
  title: z.string().trim().min(1).max(255).describe('Recording title shown in the release'),
  expectedUpdatedAt,
})

/** Body of a draft write that carries nothing but the version it was read at. */
export const ReleaseDraftVersionSchema = z.strictObject({ expectedUpdatedAt })

/** The full new order: every active recording on the draft, each exactly once. */
export const ReorderReleaseTracksSchema = z.strictObject({
  trackIds: z
    .array(z.uuid())
    .min(1)
    .max(50)
    .refine((ids) => new Set(ids).size === ids.length, RELEASE_VALIDATION.DUPLICATE_ITEMS)
    .describe('Recording ids in their new order'),
  expectedUpdatedAt,
})

export class UploadReleaseCoverDto extends createZodDto(UploadReleaseCoverSchema) {}
export class UploadReleaseTrackDto extends createZodDto(UploadReleaseTrackSchema) {}
export class ReleaseDraftVersionDto extends createZodDto(ReleaseDraftVersionSchema) {}
export class ReorderReleaseTracksDto extends createZodDto(ReorderReleaseTracksSchema) {}
