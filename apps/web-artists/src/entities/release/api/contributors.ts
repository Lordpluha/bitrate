import type { ApiSchemas } from '@bitrate/contracts'
import { clientFetchClient } from '@shared/api/fetchClient'
import {
  contributorResultSchema,
  participantSchema,
} from '../model/contributor.schema'

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
    throw new Error('This release or contributor is no longer available.')
  const parsed = contributorResultSchema.safeParse(result.data)
  if (
    !result.response.ok ||
    !parsed.success ||
    parsed.data.release.id !== id ||
    parsed.data.participant.id !== contributorId
  )
    throw new Error('Could not load the latest contributor. Please try again.')
  return parsed.data
}

export async function saveContributor(
  request: ContributorRequest,
  contributorId?: string,
) {
  const { id, input } = request
  const unconfirmed =
    'Could not confirm the contributor was saved. Close this form and check Participants before trying again.'
  let result: Awaited<ReturnType<typeof sendContributor>>
  try {
    result = await sendContributor(request, contributorId)
  } catch {
    throw new Error(unconfirmed)
  }
  if (result.response.status === 409)
    throw new Error(
      'This release changed or is no longer a draft. Your entries are kept here; close and reopen the form to review the latest version.',
    )
  if (result.response.status === 404)
    throw new Error('This release or contributor is no longer available.')
  if (result.response.status === 400)
    throw new Error('Check the contributor name and roles, then try again.')
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
  const signal = AbortSignal.timeout(30_000)
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
