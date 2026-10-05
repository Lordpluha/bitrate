import type { ApiSchemas } from '@bitrate/contracts'
import { clientFetchClient } from '@shared/api/fetchClient'
import {
  type CreateReleaseValues,
  releasePageSchema,
  releaseSummarySchema,
} from '../model/release.schema'

export const RELEASE_PAGE_SIZE = 20
const CREATE_RELEASE_TIMEOUT_MS = 30_000

export async function getRelease(id: string, signal: AbortSignal) {
  const result = await clientFetchClient.GET('/api/v1/releases/{id}', {
    params: { path: { id } },
    signal,
  })
  if (result.response.status === 404)
    throw new Error('This release is no longer available.')
  const parsed = releaseSummarySchema.safeParse(result.data)
  if (!result.response.ok || !parsed.success || parsed.data.id !== id)
    throw new Error('Could not load the latest release. Please try again.')
  return parsed.data
}

export async function updateRelease({
  id,
  input,
}: {
  id: string
  input: ApiSchemas['UpdateReleaseDto']
}) {
  const unconfirmed =
    'Could not confirm your changes were saved. Close this form and check Music before trying again.'
  let result: Awaited<ReturnType<typeof sendUpdate>>
  try {
    result = await sendUpdate(id, input)
  } catch {
    throw new Error(unconfirmed)
  }
  if (result.response.status === 409)
    throw new Error(
      'This release changed or is no longer a draft. Your entries are kept here; close and reopen the form to review the latest version.',
    )
  if (result.response.status === 404)
    throw new Error('This release is no longer available.')
  if (result.response.status === 400)
    throw new Error('Check the release details, then try again.')
  const parsed = releaseSummarySchema.safeParse(result.data)
  if (
    !result.response.ok ||
    !parsed.success ||
    parsed.data.id !== id ||
    parsed.data.status !== 'DRAFT' ||
    (input.title !== undefined && parsed.data.title !== input.title.trim()) ||
    (input.type !== undefined && parsed.data.type !== input.type) ||
    (input.scheduledAt !== undefined &&
      (parsed.data.scheduledAt === null
        ? null
        : new Date(parsed.data.scheduledAt).toISOString()) !==
        (input.scheduledAt === null
          ? null
          : new Date(input.scheduledAt).toISOString()))
  )
    throw new Error(unconfirmed)
  return parsed.data
}

function sendUpdate(id: string, input: ApiSchemas['UpdateReleaseDto']) {
  return clientFetchClient.PATCH('/api/v1/releases/{id}', {
    params: { path: { id } },
    body: input,
    signal: AbortSignal.timeout(CREATE_RELEASE_TIMEOUT_MS),
  })
}

export async function getReleases(page: number, signal: AbortSignal) {
  try {
    const result = await clientFetchClient.GET('/api/v1/releases', {
      params: { query: { page, limit: RELEASE_PAGE_SIZE } },
      signal,
    })
    if (!result.response.ok) throw new Error('Release list unavailable')
    const parsed = releasePageSchema.safeParse(result.data)
    if (
      !parsed.success ||
      parsed.data.page !== page ||
      parsed.data.limit !== RELEASE_PAGE_SIZE
    )
      throw new Error('Invalid release list')
    return parsed.data
  } catch {
    throw new Error('Could not load your releases. Please try again.')
  }
}

export async function createRelease(input: CreateReleaseValues) {
  let result: Awaited<ReturnType<typeof sendDraft>>
  try {
    result = await sendDraft(input)
  } catch {
    throw new Error(
      'Could not confirm your draft was saved. Check Music before trying again.',
    )
  }
  if (result.response.status === 400)
    throw new Error('Check the release title and type, then try again.')
  const parsed = releaseSummarySchema.safeParse(result.data)
  if (
    !result.response.ok ||
    !parsed.success ||
    parsed.data.status !== 'DRAFT' ||
    parsed.data.title !== input.title.trim() ||
    parsed.data.type !== input.type
  )
    throw new Error(
      'Could not confirm your draft was saved. Check Music before trying again.',
    )
  return parsed.data
}

function sendDraft(input: CreateReleaseValues) {
  return clientFetchClient.POST('/api/v1/releases', {
    body: input,
    signal: AbortSignal.timeout(CREATE_RELEASE_TIMEOUT_MS),
  })
}
