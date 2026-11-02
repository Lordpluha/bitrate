import type { ApiSchemas } from '@bitrate/contracts'
import { clientFetchClient } from '@shared/api/fetchClient'
import { writeSignal } from '@shared/api/writeTimeout'
import { messageKey } from '@shared/i18n'
import { z } from 'zod'
import {
  contributorResultSchema,
  participantSchema,
} from '../model/contributor.schema'
import { releaseSummarySchema } from '../model/release.schema'
import { advancedRelease, guardedWrite } from './guardedWrite'

export interface ContributorRequest {
  id: string
  input: ApiSchemas['AddReleaseContributorDto']
}

export async function getContributor(
  id: string,
  contributorId: string,
  signal: AbortSignal,
) {
  const result = await clientFetchClient.GET(
    '/api/v1/releases/{id}/contributors/{contributorId}',
    { params: { path: { id, contributorId } }, signal },
  )
  if (result.response.status === 404)
    throw new Error(messageKey('release.error.contributorGone'))
  const parsed = contributorResultSchema.safeParse(result.data)
  if (
    !result.response.ok ||
    !parsed.success ||
    parsed.data.release.id !== id ||
    parsed.data.participant.id !== contributorId
  )
    throw new Error(messageKey('release.error.loadContributor'))
  return parsed.data
}

export async function saveContributor(
  request: ContributorRequest,
  contributorId?: string,
) {
  const { id, input } = request
  const unconfirmed = messageKey('release.error.contributorUnconfirmed')
  let result: Awaited<ReturnType<typeof sendContributor>>
  try {
    result = await sendContributor(request, contributorId)
  } catch {
    throw new Error(unconfirmed)
  }
  if (result.response.status === 409)
    throw new Error(messageKey('release.error.stale'))
  if (result.response.status === 404)
    throw new Error(messageKey('release.error.contributorGone'))
  if (result.response.status === 400)
    throw new Error(messageKey('release.error.contributorInvalid'))
  const parsed = contributorResultSchema.safeParse(result.data)
  if (
    result.response.status !== (contributorId ? 200 : 201) ||
    !parsed.success ||
    !participantSchema.safeParse(parsed.data.participant).success ||
    parsed.data.release.id !== id ||
    parsed.data.release.status !== 'DRAFT' ||
    (contributorId !== undefined &&
      parsed.data.participant.id !== contributorId) ||
    Date.parse(parsed.data.release.updatedAt) <=
      Date.parse(input.expectedUpdatedAt) ||
    parsed.data.participant.displayName !== input.displayName.trim() ||
    parsed.data.participant.roles.length !== input.roles.length ||
    !input.roles.every((role) => parsed.data.participant.roles.includes(role))
  )
    throw new Error(unconfirmed)
  return parsed.data
}

function sendContributor(
  { id, input }: ContributorRequest,
  contributorId?: string,
) {
  const signal = writeSignal()
  if (contributorId)
    return clientFetchClient.PATCH(
      '/api/v1/releases/{id}/contributors/{contributorId}',
      { params: { path: { id, contributorId } }, body: input, signal },
    )
  return clientFetchClient.POST('/api/v1/releases/{id}/contributors', {
    params: { path: { id } },
    body: input,
    signal,
  })
}

const removedContributorSchema = z.object({
  release: releaseSummarySchema,
  contributorId: z.uuid(),
})

export interface ContributorRemovalRequest {
  id: string
  contributorId: string
  expectedUpdatedAt: string
}

export function removeContributor({
  id,
  contributorId,
  expectedUpdatedAt,
}: ContributorRemovalRequest) {
  return guardedWrite(
    () =>
      clientFetchClient.DELETE(
        '/api/v1/releases/{id}/contributors/{contributorId}',
        {
          params: { path: { id, contributorId } },
          body: { expectedUpdatedAt },
          signal: writeSignal(),
        },
      ),
    (data) => {
      const parsed = removedContributorSchema.safeParse(data)
      return parsed.success &&
        parsed.data.contributorId === contributorId &&
        advancedRelease(parsed.data.release, id, expectedUpdatedAt)
        ? parsed.data
        : undefined
    },
    {
      invalid: messageKey('release.error.removeContributorInvalid'),
      unconfirmed: messageKey('release.error.removeContributorUnconfirmed'),
    },
  )
}

export interface CreditSelfRequest {
  id: string
  expectedUpdatedAt: string
}

/** Credits the artist alone with every writing role and 100% of both splits. */
export function creditSelf({ id, expectedUpdatedAt }: CreditSelfRequest) {
  return guardedWrite(
    () =>
      clientFetchClient.POST('/api/v1/releases/{id}/contributors/self', {
        params: { path: { id } },
        body: { expectedUpdatedAt },
        signal: writeSignal(),
      }),
    (data) => {
      const parsed = contributorResultSchema.safeParse(data)
      return parsed.success &&
        advancedRelease(parsed.data.release, id, expectedUpdatedAt)
        ? parsed.data
        : undefined
    },
    {
      invalid: messageKey('release.error.creditSelfInvalid'),
      unconfirmed: messageKey('release.error.creditSelfUnconfirmed'),
      conflict: messageKey('release.error.creditSelfConflict'),
    },
  )
}
