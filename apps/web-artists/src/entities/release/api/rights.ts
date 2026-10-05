import type { ApiSchemas } from '@bitrate/contracts'
import { clientFetchClient } from '@shared/api/fetchClient'
import { z } from 'zod'
import {
  type ReleaseSummary,
  releaseSummarySchema,
} from '../model/release.schema'
import { releaseBlockerSchema, rightTypes } from '../model/rights'
import { identifierConflict } from './releases'

const WRITE_TIMEOUT_MS = 30_000
const STALE =
  'This release changed or is no longer a draft. Your entries are kept here; close and reopen the form to review the latest version.'

interface WriteResult {
  response: Response
  data?: unknown
  error?: unknown
}

interface WriteMessages {
  invalid: string
  unconfirmed: string
  conflict?: string
}

/** Maps API failures to recoverable messages; never confirms an unverified write. */
async function guardedWrite<T>(
  send: () => Promise<WriteResult>,
  confirm: (data: unknown) => T | undefined,
  messages: WriteMessages,
): Promise<T> {
  let result: WriteResult
  try {
    result = await send()
  } catch {
    throw new Error(messages.unconfirmed)
  }
  const { status } = result.response
  if (status === 409)
    throw new Error(
      identifierConflict(result.error) ?? messages.conflict ?? STALE,
    )
  if (status === 404) throw new Error('This release is no longer available.')
  if (status === 400) throw new Error(messages.invalid)
  const confirmed = result.response.ok ? confirm(result.data) : undefined
  if (confirmed === undefined) throw new Error(messages.unconfirmed)
  return confirmed
}

/** A confirmed write returns this release with a newer version. */
function advancedRelease(
  data: unknown,
  id: string,
  expectedUpdatedAt: string,
): ReleaseSummary | undefined {
  const parsed = releaseSummarySchema.safeParse(data)
  if (
    !parsed.success ||
    parsed.data.id !== id ||
    Date.parse(parsed.data.updatedAt) <= Date.parse(expectedUpdatedAt)
  )
    return undefined
  return parsed.data
}

const signal = () => AbortSignal.timeout(WRITE_TIMEOUT_MS)

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

export async function submitRelease({ id, input }: SubmitRequest) {
  const unconfirmed =
    'Review request was not confirmed. Your saved draft remains; check the release and try again.'
  let result: WriteResult
  try {
    result = await clientFetchClient.POST('/api/v1/releases/{id}/submit', {
      params: { path: { id } },
      body: input,
      signal: signal(),
    })
  } catch {
    throw new Error(unconfirmed)
  }
  if (result.response.status === 422) {
    const blocked = blockedSchema.safeParse(result.error)
    throw new Error(
      blocked.success
        ? `Resolve ${blocked.data.blockers.length} ${blocked.data.blockers.length === 1 ? 'blocker' : 'blockers'} before submission.`
        : unconfirmed,
    )
  }
  return guardedWrite(
    () => Promise.resolve(result),
    (data) => {
      const release = advancedRelease(data, id, input.expectedUpdatedAt)
      return release?.status === 'SUBMITTED' ? release : undefined
    },
    { invalid: 'Confirm that you reviewed this draft.', unconfirmed },
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
    (data) => {
      const release = releaseSummarySchema.safeParse(data)
      return release.success &&
        release.data.id === id &&
        release.data.status === 'DRAFT'
        ? release.data
        : undefined
    },
    {
      invalid: 'Could not withdraw this release. Please try again.',
      unconfirmed:
        'Could not confirm the withdrawal. Check the release before trying again.',
      conflict:
        'This release changed or is no longer awaiting review. Reload it to see its latest status.',
    },
  )
}
