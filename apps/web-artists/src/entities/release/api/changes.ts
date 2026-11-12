import { clientFetchClient } from '@shared/api/fetchClient'
import { uploadForm } from '@shared/api/uploadForm'
import { writeSignal } from '@shared/api/writeTimeout'
import { messageKey, type TranslationKey } from '@shared/i18n'
import { z } from 'zod'
import {
  artistReleaseChangeListSchema,
  releaseChangeRequestSchema,
} from '../model/changes.schema'
import { guardedWrite } from './guardedWrite'

/** A cover is one image; this is far below the master upload timeout. */
const COVER_TIMEOUT_MS = 5 * 60_000

/** 409 reasons the artist can act on, by the API's error code. */
const CONFLICTS: Record<string, TranslationKey> = {
  'errors.release.changes_not_allowed': messageKey(
    'releaseChanges.error.notAllowed',
  ),
  'errors.release.change_unchanged': messageKey(
    'releaseChanges.error.unchanged',
  ),
  'errors.release.change_already_pending': messageKey(
    'releaseChanges.error.alreadyPending',
  ),
  'errors.release.change_not_pending': messageKey(
    'releaseChanges.error.notPending',
  ),
  'errors.release.recording_locked': messageKey(
    'releaseChanges.error.recordingLocked',
  ),
}

const errorCodeSchema = z.object({ code: z.string() })

function conflictMessage(error: unknown): TranslationKey {
  const parsed = errorCodeSchema.safeParse(error)
  return (
    (parsed.success ? CONFLICTS[parsed.data.code] : undefined) ??
    messageKey('releaseChanges.error.conflict')
  )
}

export async function getReleaseChanges(id: string, signal: AbortSignal) {
  const result = await clientFetchClient.GET(
    '/api/v1/artists/me/releases/{id}/changes',
    { params: { path: { id } }, signal },
  )
  if (result.response.status === 404)
    throw new Error(messageKey('release.error.gone'))
  const parsed = artistReleaseChangeListSchema.safeParse(result.data)
  if (!result.response.ok || !parsed.success)
    throw new Error(messageKey('releaseChanges.error.load'))
  return parsed.data.data
}

export interface SubmitReleaseChangesRequest {
  id: string
  title?: string
  recordings?: { id: string; title: string }[]
  cover?: File
}

export function submitReleaseChanges({
  id,
  title,
  recordings,
  cover,
}: SubmitReleaseChangesRequest) {
  const form = new FormData()
  if (title !== undefined) form.append('title', title)
  if (recordings?.length) form.append('recordings', JSON.stringify(recordings))
  if (cover) form.append('cover', cover)
  return guardedWrite(
    async () => {
      const result = await uploadForm({
        method: 'POST',
        path: `/api/v1/artists/me/releases/${id}/changes`,
        form,
        signal: AbortSignal.timeout(COVER_TIMEOUT_MS),
      })
      if (result.status === 413)
        throw new Error(messageKey('release.error.fileTooLarge'))
      return {
        response: new Response(null, { status: result.status }),
        data: result.ok ? result.data : undefined,
        error: result.ok ? undefined : result.data,
      }
    },
    (data) => {
      const parsed = releaseChangeRequestSchema.safeParse(data)
      return parsed.success && parsed.data.releaseId === id
        ? parsed.data
        : undefined
    },
    {
      invalid: messageKey('releaseChanges.error.invalid'),
      unconfirmed: messageKey('releaseChanges.error.unconfirmed'),
      statusMessages: { 409: conflictMessage },
    },
  )
}

export interface WithdrawReleaseChangesRequest {
  id: string
  requestId: string
}

export function withdrawReleaseChanges({
  id,
  requestId,
}: WithdrawReleaseChangesRequest) {
  return guardedWrite(
    () =>
      clientFetchClient.POST(
        '/api/v1/artists/me/releases/{id}/changes/{requestId}/withdraw',
        { params: { path: { id, requestId } }, signal: writeSignal() },
      ),
    (data) => {
      const parsed = releaseChangeRequestSchema.safeParse(data)
      return parsed.success && parsed.data.id === requestId
        ? parsed.data
        : undefined
    },
    {
      invalid: messageKey('releaseChanges.error.unconfirmed'),
      unconfirmed: messageKey('releaseChanges.error.unconfirmed'),
      statusMessages: { 409: conflictMessage },
    },
  )
}
