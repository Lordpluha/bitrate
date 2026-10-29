import type { ApiSchemas } from '@bitrate/contracts'
import { clientFetchClient } from '@shared/api/fetchClient'
import { writeSignal as signal } from '@shared/api/writeTimeout'
import { messageKey } from '@shared/i18n'
import { z } from 'zod'
import {
  type ReleaseSummary,
  releaseSummarySchema,
} from '../model/release.schema'
import { releaseBlockerSchema, rightTypes } from '../model/rights'
import {
  advancedRelease,
  draftRelease,
  guardedWrite,
  type WriteMessages,
} from './guardedWrite'

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
      invalid: messageKey('release.error.rightsInvalid'),
      unconfirmed: messageKey('release.error.rightsUnconfirmed'),
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
      invalid: messageKey('release.error.splitsInvalid'),
      unconfirmed: messageKey('release.error.splitsUnconfirmed'),
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
      invalid: messageKey('release.error.isrcInvalid'),
      unconfirmed: messageKey('release.error.isrcUnconfirmed'),
    },
  )
}

export interface SubmitRequest {
  id: string
  input: ApiSchemas['SubmitReleaseDto']
}

const blockedSchema = z.object({ blockers: z.array(releaseBlockerSchema) })

export function submitRelease({ id, input }: SubmitRequest) {
  const unconfirmed = messageKey('release.error.submitUnconfirmed')
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
      invalid: messageKey('release.error.submitInvalid'),
      unconfirmed,
      statusMessages: {
        // The workspace lists the blockers and their count; the error only points there.
        422: (error) =>
          blockedSchema.safeParse(error).success
            ? messageKey('release.error.submitBlocked')
            : unconfirmed,
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
      invalid: messageKey('release.error.withdrawInvalid'),
      unconfirmed: messageKey('release.error.withdrawUnconfirmed'),
      conflict: messageKey('release.error.withdrawConflict'),
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
      invalid: messageKey('release.error.reviseInvalid'),
      unconfirmed: messageKey('release.error.reviseUnconfirmed'),
      conflict: messageKey('release.error.reviseConflict'),
    },
  )
}

export interface PublishRequest {
  id: string
  input: ApiSchemas['ReleaseDraftVersionDto']
}

/** Starts publishing an approved release on Bitrate; confirmed once the API reports it underway. */
export function publishRelease({ id, input }: PublishRequest) {
  return guardedWrite(
    () =>
      clientFetchClient.POST('/api/v1/releases/{id}/publish', {
        params: { path: { id } },
        body: input,
        signal: signal(),
      }),
    (data) => {
      const parsed = releaseSummarySchema.safeParse(data)
      return parsed.success &&
        parsed.data.id === id &&
        (parsed.data.status === 'PUBLISHING' ||
          parsed.data.status === 'SCHEDULED')
        ? parsed.data
        : undefined
    },
    {
      invalid: messageKey('release.error.publishInvalid'),
      unconfirmed: messageKey('release.error.publishUnconfirmed'),
      conflict: messageKey('release.error.publishConflict'),
    },
  )
}

/** Owner actions on a release that went live or is waiting for its premiere. */
function launchWrite(
  path:
    | '/api/v1/releases/{id}/publish/cancel'
    | '/api/v1/releases/{id}/unpublish'
    | '/api/v1/releases/{id}/republish',
  expected: ReleaseSummary['status'],
  messages: Required<Omit<WriteMessages, 'statusMessages'>>,
) {
  return ({ id, input }: PublishRequest) =>
    guardedWrite(
      () =>
        clientFetchClient.POST(path, {
          params: { path: { id } },
          body: input,
          signal: signal(),
        }),
      (data) => {
        const parsed = releaseSummarySchema.safeParse(data)
        return parsed.success &&
          parsed.data.id === id &&
          parsed.data.status === expected
          ? parsed.data
          : undefined
      },
      messages,
    )
}

export const cancelPremiere = launchWrite(
  '/api/v1/releases/{id}/publish/cancel',
  'READY',
  {
    invalid: messageKey('release.error.cancelInvalid'),
    unconfirmed: messageKey('release.error.cancelUnconfirmed'),
    conflict: messageKey('release.error.cancelConflict'),
  },
)

export const unpublishRelease = launchWrite(
  '/api/v1/releases/{id}/unpublish',
  'UNPUBLISHED',
  {
    invalid: messageKey('release.error.unpublishInvalid'),
    unconfirmed: messageKey('release.error.unpublishUnconfirmed'),
    conflict: messageKey('release.error.unpublishConflict'),
  },
)

export const republishRelease = launchWrite(
  '/api/v1/releases/{id}/republish',
  'RELEASED',
  {
    invalid: messageKey('release.error.republishInvalid'),
    unconfirmed: messageKey('release.error.republishUnconfirmed'),
    conflict: messageKey('release.error.republishConflict'),
  },
)
