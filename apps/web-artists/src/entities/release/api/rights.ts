import type { ApiSchemas } from '@bitrate/contracts'
import { clientFetchClient } from '@shared/api/fetchClient'
import { writeSignal as signal } from '@shared/api/writeTimeout'
import { z } from 'zod'
import { releaseSummarySchema } from '../model/release.schema'
import { releaseBlockerSchema, rightTypes } from '../model/rights'
import { advancedRelease, draftRelease, guardedWrite } from './guardedWrite'

export interface RightsRequest {
  id: string
  input: ApiSchemas['UpdateReleaseRightsDto']
}

export function saveRights({ id, input }: RightsRequest) {
  return guardedWrite(
    () =>
      clientFetchClient.PATCH('/api/v1/releases/{id}/rights', {
        params: { path: { id } },
        body: input,
        signal: signal(),
      }),
    (data) => advancedRelease(data, id, input.expectedUpdatedAt),
    {
      invalid: 'Choose the master owner and enter their name, then try again.',
      unconfirmed:
        'Could not confirm the rights were saved. Close this form and check the release before trying again.',
    },
  )
}

const splitsResultSchema = z.object({
  release: releaseSummarySchema,
  rightType: z.enum(rightTypes),
  shares: z.array(
    z.object({
      contributorId: z.uuid(),
      shareBasisPoints: z.number().int(),
    }),
  ),
})

export interface SplitsRequest {
  id: string
  input: ApiSchemas['ReplaceReleaseSplitsDto']
}

export function saveSplits({ id, input }: SplitsRequest) {
  return guardedWrite(
    () =>
      clientFetchClient.PUT('/api/v1/releases/{id}/splits', {
        params: { path: { id } },
        body: input,
        signal: signal(),
      }),
    (data) => {
      const parsed = splitsResultSchema.safeParse(data)
      if (
        !parsed.success ||
        !advancedRelease(parsed.data.release, id, input.expectedUpdatedAt) ||
        parsed.data.rightType !== input.rightType ||
        parsed.data.shares.length !== input.shares.length
      )
        return undefined
      return parsed.data
    },
    {
      invalid:
        'Each share must be above 0%, the total cannot exceed 100%, and every person must be credited on this release.',
      unconfirmed:
        'Could not confirm the splits were saved. Close this form and check the release before trying again.',
    },
  )
}

const trackResultSchema = z.object({
  release: releaseSummarySchema,
  track: z.object({ id: z.uuid(), isrc: z.string().nullable() }),
})

export interface TrackIsrcRequest {
  id: string
  trackId: string
  input: ApiSchemas['UpdateReleaseTrackDto']
}

export function saveTrackIsrc({ id, trackId, input }: TrackIsrcRequest) {
  return guardedWrite(
    () =>
      clientFetchClient.PATCH('/api/v1/releases/{id}/tracks/{trackId}', {
        params: { path: { id, trackId } },
        body: input,
        signal: signal(),
      }),
    (data) => {
      const parsed = trackResultSchema.safeParse(data)
      if (
        !parsed.success ||
        !advancedRelease(parsed.data.release, id, input.expectedUpdatedAt) ||
        parsed.data.track.id !== trackId
      )
        return undefined
      return parsed.data
    },
    {
      invalid: 'Enter an ISRC such as US-RC1-76-07839.',
      unconfirmed:
        'Could not confirm the ISRC was saved. Close this form and check the tracks before trying again.',
    },
  )
}

export interface SubmitRequest {
  id: string
  input: ApiSchemas['SubmitReleaseDto']
}

const blockedSchema = z.object({ blockers: z.array(releaseBlockerSchema) })

export function submitRelease({ id, input }: SubmitRequest) {
  const unconfirmed =
    'Review request was not confirmed. Your saved draft remains; check the release and try again.'
  return guardedWrite(
    () =>
      clientFetchClient.POST('/api/v1/releases/{id}/submit', {
        params: { path: { id } },
        body: input,
        signal: signal(),
      }),
    (data) => {
      const release = advancedRelease(data, id, input.expectedUpdatedAt)
      return release?.status === 'SUBMITTED' ? release : undefined
    },
    {
      invalid: 'Confirm that you reviewed this draft.',
      unconfirmed,
      statusMessages: {
        422: (error) => {
          const blocked = blockedSchema.safeParse(error)
          if (!blocked.success) return unconfirmed
          const count = blocked.data.blockers.length
          return `Resolve ${count} ${count === 1 ? 'blocker' : 'blockers'} before submission.`
        },
      },
    },
  )
}

export interface WithdrawRequest {
  id: string
  input: ApiSchemas['WithdrawReleaseDto']
}

export function withdrawRelease({ id, input }: WithdrawRequest) {
  return guardedWrite(
    () =>
      clientFetchClient.POST('/api/v1/releases/{id}/withdraw', {
        params: { path: { id } },
        body: input,
        signal: signal(),
      }),
    (data) => draftRelease(data, id),
    {
      invalid: 'Could not withdraw this release. Please try again.',
      unconfirmed:
        'Could not confirm the withdrawal. Check the release before trying again.',
      conflict:
        'This release changed or is no longer awaiting review. Reload it to see its latest status.',
    },
  )
}

export interface ReviseRequest {
  id: string
  input: ApiSchemas['ReviseReleaseDto']
}

/** Reopens a release Bitrate sent back for changes as an editable draft. */
export function reviseRelease({ id, input }: ReviseRequest) {
  return guardedWrite(
    () =>
      clientFetchClient.POST('/api/v1/releases/{id}/revise', {
        params: { path: { id } },
        body: input,
        signal: signal(),
      }),
    (data) => draftRelease(data, id),
    {
      invalid: 'Could not reopen this release. Please try again.',
      unconfirmed:
        'Could not confirm the release was reopened. Check it before trying again.',
      conflict:
        'This release changed or no changes were requested. Reload it to see its latest status.',
    },
  )
}
