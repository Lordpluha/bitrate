import {
  type ReleaseSummary,
  releaseSummarySchema,
} from '../model/release.schema'
import { identifierConflict } from './releases'

const STALE =
  'This release changed or is no longer a draft. Your entries are kept here; close and reopen the form to review the latest version.'

export interface WriteResult {
  response: Response
  data?: unknown
  error?: unknown
}

export interface WriteMessages {
  invalid: string
  unconfirmed: string
  conflict?: string
  /** Statuses this write explains itself, checked first; a function reads the error body. */
  statusMessages?: Partial<
    Record<number, string | ((error: unknown) => string)>
  >
}

/** Maps API failures to recoverable messages; never confirms an unverified write. */
export async function guardedWrite<T>(
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
  const own = messages.statusMessages?.[status]
  if (own !== undefined)
    throw new Error(typeof own === 'string' ? own : own(result.error))
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
export function advancedRelease(
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

/** A confirmed withdraw or revise returns this release back in draft. */
export function draftRelease(
  data: unknown,
  id: string,
): ReleaseSummary | undefined {
  const parsed = releaseSummarySchema.safeParse(data)
  return parsed.success &&
    parsed.data.id === id &&
    parsed.data.status === 'DRAFT'
    ? parsed.data
    : undefined
}
