import { clientFetchClient } from '@shared/api/fetchClient'
import { uploadForm } from '@shared/api/uploadForm'
import { writeSignal } from '@shared/api/writeTimeout'
import { messageKey } from '@shared/i18n'
import { z } from 'zod'
import { releaseSummarySchema } from '../model/release.schema'
import { advancedRelease, guardedWrite, type WriteResult } from './guardedWrite'

/** Large masters on slow links need far longer than a JSON write. */
const UPLOAD_TIMEOUT_MS = 30 * 60_000

const coverResultSchema = z.object({
  release: releaseSummarySchema,
  cover: z.string().startsWith('/static/').nullable(),
})

const trackDraftSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  hasAudio: z.boolean(),
  audioFileName: z.string().nullable(),
  audioSizeBytes: z.number().int().nonnegative().nullable(),
})

const trackResultSchema = z.object({
  release: releaseSummarySchema,
  track: trackDraftSchema,
})

const removedTrackSchema = z.object({
  release: releaseSummarySchema,
  trackId: z.uuid(),
})

const renamedTrackSchema = z.object({
  release: releaseSummarySchema,
  track: z.object({ id: z.uuid(), title: z.string() }),
})

/** Adapts an XHR upload to the same result shape `guardedWrite` reads from the JSON client. */
async function multipart(
  method: 'POST' | 'PUT',
  path: string,
  form: FormData,
  onProgress?: (fraction: number) => void,
): Promise<WriteResult> {
  const result = await uploadForm({
    method,
    path,
    form,
    onProgress,
    signal: AbortSignal.timeout(UPLOAD_TIMEOUT_MS),
  })
  if (result.status === 413)
    throw new Error(messageKey('release.error.fileTooLarge'))
  return {
    response: new Response(null, { status: result.status }),
    data: result.ok ? result.data : undefined,
    error: result.ok ? undefined : result.data,
  }
}

export interface CoverUploadRequest {
  id: string
  file: File
  expectedUpdatedAt: string
  onProgress?: (fraction: number) => void
}

export function uploadCover({
  id,
  file,
  expectedUpdatedAt,
  onProgress,
}: CoverUploadRequest) {
  const form = new FormData()
  form.append('expectedUpdatedAt', expectedUpdatedAt)
  form.append('cover', file)
  return guardedWrite(
    () => multipart('PUT', `/api/v1/releases/${id}/cover`, form, onProgress),
    (data) => {
      const parsed = coverResultSchema.safeParse(data)
      return parsed.success &&
        parsed.data.cover &&
        advancedRelease(parsed.data.release, id, expectedUpdatedAt)
        ? parsed.data
        : undefined
    },
    {
      invalid: messageKey('release.error.coverInvalid'),
      unconfirmed: messageKey('release.error.coverUnconfirmed'),
    },
  )
}

export interface DraftVersionRequest {
  id: string
  expectedUpdatedAt: string
}

export function removeCover({ id, expectedUpdatedAt }: DraftVersionRequest) {
  return guardedWrite(
    () =>
      clientFetchClient.DELETE('/api/v1/releases/{id}/cover', {
        params: { path: { id } },
        body: { expectedUpdatedAt },
        signal: writeSignal(),
      }),
    (data) => {
      const parsed = coverResultSchema.safeParse(data)
      return parsed.success &&
        parsed.data.cover === null &&
        advancedRelease(parsed.data.release, id, expectedUpdatedAt)
        ? parsed.data
        : undefined
    },
    {
      invalid: messageKey('release.error.coverRemoveInvalid'),
      unconfirmed: messageKey('release.error.coverRemoveUnconfirmed'),
    },
  )
}

export interface TrackUploadRequest {
  id: string
  /** Replaces the master of this recording; omitted to add a new recording. */
  trackId?: string
  title?: string
  file: File
  expectedUpdatedAt: string
  onProgress?: (fraction: number) => void
}

export function uploadTrack({
  id,
  trackId,
  title,
  file,
  expectedUpdatedAt,
  onProgress,
}: TrackUploadRequest) {
  const form = new FormData()
  if (title !== undefined && trackId === undefined) form.append('title', title)
  form.append('expectedUpdatedAt', expectedUpdatedAt)
  form.append('audio', file)
  const replacing = trackId !== undefined
  return guardedWrite(
    () =>
      replacing
        ? multipart(
            'PUT',
            `/api/v1/releases/${id}/tracks/${trackId}/audio`,
            form,
            onProgress,
          )
        : multipart('POST', `/api/v1/releases/${id}/tracks`, form, onProgress),
    (data) => {
      const parsed = trackResultSchema.safeParse(data)
      if (
        !parsed.success ||
        !parsed.data.track.hasAudio ||
        (replacing && parsed.data.track.id !== trackId) ||
        !advancedRelease(parsed.data.release, id, expectedUpdatedAt)
      )
        return undefined
      return parsed.data
    },
    {
      invalid: messageKey('release.error.audioInvalid'),
      unconfirmed: messageKey('release.error.audioUnconfirmed'),
    },
  )
}

export interface TrackRequest extends DraftVersionRequest {
  trackId: string
}

export function removeTrack({ id, trackId, expectedUpdatedAt }: TrackRequest) {
  return guardedWrite(
    () =>
      clientFetchClient.DELETE('/api/v1/releases/{id}/tracks/{trackId}', {
        params: { path: { id, trackId } },
        body: { expectedUpdatedAt },
        signal: writeSignal(),
      }),
    (data) => {
      const parsed = removedTrackSchema.safeParse(data)
      return parsed.success &&
        parsed.data.trackId === trackId &&
        advancedRelease(parsed.data.release, id, expectedUpdatedAt)
        ? parsed.data
        : undefined
    },
    {
      invalid: messageKey('release.error.recordingRemoveInvalid'),
      unconfirmed: messageKey('release.error.recordingRemoveUnconfirmed'),
    },
  )
}

export interface RenameTrackRequest extends TrackRequest {
  title: string
}

export function renameTrack({
  id,
  trackId,
  title,
  expectedUpdatedAt,
}: RenameTrackRequest) {
  return guardedWrite(
    () =>
      clientFetchClient.PATCH('/api/v1/releases/{id}/tracks/{trackId}', {
        params: { path: { id, trackId } },
        body: { title, expectedUpdatedAt },
        signal: writeSignal(),
      }),
    (data) => {
      const parsed = renamedTrackSchema.safeParse(data)
      return parsed.success &&
        parsed.data.track.id === trackId &&
        parsed.data.track.title === title.trim() &&
        advancedRelease(parsed.data.release, id, expectedUpdatedAt)
        ? parsed.data
        : undefined
    },
    {
      invalid: messageKey('release.error.titleInvalid'),
      unconfirmed: messageKey('release.error.titleUnconfirmed'),
    },
  )
}

const reorderedSchema = z.object({
  release: releaseSummarySchema,
  trackIds: z.array(z.uuid()),
})

export interface ReorderTracksRequest extends DraftVersionRequest {
  trackIds: string[]
}

/** Saves the full running order; the API rejects a list that misses or repeats a recording. */
export function reorderTracks({
  id,
  trackIds,
  expectedUpdatedAt,
}: ReorderTracksRequest) {
  return guardedWrite(
    () =>
      clientFetchClient.PUT('/api/v1/releases/{id}/tracks/order', {
        params: { path: { id } },
        body: { trackIds, expectedUpdatedAt },
        signal: writeSignal(),
      }),
    (data) => {
      const parsed = reorderedSchema.safeParse(data)
      return parsed.success &&
        parsed.data.trackIds.join() === trackIds.join() &&
        advancedRelease(parsed.data.release, id, expectedUpdatedAt)
        ? parsed.data
        : undefined
    },
    {
      invalid: messageKey('release.error.reorderInvalid'),
      unconfirmed: messageKey('release.error.reorderUnconfirmed'),
      statusMessages: {
        422: messageKey('release.error.reorderChanged'),
      },
    },
  )
}
