import type { ApiSchemas } from '@bitrate/contracts'
import { clientFetchClient } from '@shared/api/fetchClient'
import { writeSignal } from '@shared/api/writeTimeout'
import { messageKey } from '@shared/i18n'
import { z } from 'zod'
import {
  type CreateReleaseValues,
  releaseSummarySchema,
} from '../model/release.schema'

const identifierConflicts = {
  'This UPC is already used by another release': messageKey(
    'release.error.upcTaken',
  ),
  'This ISRC is already used by another recording': messageKey(
    'release.error.isrcTaken',
  ),
} as const

const identifierConflictSchema = z.object({
  message: z.enum(
    Object.keys(identifierConflicts) as [keyof typeof identifierConflicts],
  ),
})

/** A duplicate identifier is a 409 the artist can fix, unlike a stale version. */
export function identifierConflict(error: unknown): string | undefined {
  const parsed = identifierConflictSchema.safeParse(error)
  return parsed.success ? identifierConflicts[parsed.data.message] : undefined
}

export async function getRelease(id: string, signal: AbortSignal) {
  const result = await clientFetchClient.GET('/api/v1/releases/{id}', {
    params: { path: { id } },
    signal,
  })
  if (result.response.status === 404)
    throw new Error(messageKey('release.error.gone'))
  const parsed = releaseSummarySchema.safeParse(result.data)
  if (!result.response.ok || !parsed.success || parsed.data.id !== id)
    throw new Error(messageKey('release.error.loadRelease'))
  return parsed.data
}

export async function updateRelease({
  id,
  input,
}: {
  id: string
  input: ApiSchemas['UpdateReleaseDto']
}) {
  const unconfirmed = messageKey('release.error.updateUnconfirmed')
  let result: Awaited<ReturnType<typeof sendUpdate>>
  try {
    result = await sendUpdate(id, input)
  } catch {
    throw new Error(unconfirmed)
  }
  if (result.response.status === 409)
    throw new Error(
      identifierConflict(result.error) ?? messageKey('release.error.stale'),
    )
  if (result.response.status === 404)
    throw new Error(messageKey('release.error.gone'))
  if (result.response.status === 400)
    throw new Error(messageKey('release.error.updateInvalid'))
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
          : new Date(input.scheduledAt).toISOString())) ||
    (input.upc !== undefined && parsed.data.upc !== (input.upc?.trim() ?? null))
  )
    throw new Error(unconfirmed)
  return parsed.data
}

function sendUpdate(id: string, input: ApiSchemas['UpdateReleaseDto']) {
  return clientFetchClient.PATCH('/api/v1/releases/{id}', {
    params: { path: { id } },
    body: input,
    signal: writeSignal(),
  })
}

export interface DeleteReleaseRequest {
  id: string
  input: ApiSchemas['ReleaseDraftVersionDto']
}

/** Deletes a draft; only an explicit 204 confirms it. */
export async function deleteRelease({ id, input }: DeleteReleaseRequest) {
  const unconfirmed = messageKey('release.error.deleteUnconfirmed')
  let result: Awaited<ReturnType<typeof sendDelete>>
  try {
    result = await sendDelete(id, input)
  } catch {
    throw new Error(unconfirmed)
  }
  const { status } = result.response
  if (status === 409) throw new Error(messageKey('release.error.deleteStale'))
  if (status === 404) throw new Error(messageKey('release.error.gone'))
  if (status !== 204) throw new Error(unconfirmed)
}

function sendDelete(id: string, input: ApiSchemas['ReleaseDraftVersionDto']) {
  return clientFetchClient.DELETE('/api/v1/releases/{id}', {
    params: { path: { id } },
    body: input,
    signal: writeSignal(),
  })
}

export async function createRelease(input: CreateReleaseValues) {
  let result: Awaited<ReturnType<typeof sendDraft>>
  try {
    result = await sendDraft(input)
  } catch {
    throw new Error(messageKey('release.error.createUnconfirmed'))
  }
  if (result.response.status === 400)
    throw new Error(messageKey('release.error.createInvalid'))
  const parsed = releaseSummarySchema.safeParse(result.data)
  if (
    !result.response.ok ||
    !parsed.success ||
    parsed.data.status !== 'DRAFT' ||
    parsed.data.title !== input.title.trim() ||
    parsed.data.type !== input.type
  )
    throw new Error(messageKey('release.error.createUnconfirmed'))
  return parsed.data
}

function sendDraft(input: CreateReleaseValues) {
  return clientFetchClient.POST('/api/v1/releases', {
    body: input,
    signal: writeSignal(),
  })
}
