import type { ApiSchemas } from '@bitrate/contracts'
import { z } from 'zod'

/**
 * The request body every take-down/restore/revoke-sessions write sends. Shared across resources
 * because the contract's `TakeDownReasonDto` is itself shared — one shape, one place that binds
 * it.
 */
type ContractTakeDownReason = ApiSchemas['TakeDownReasonDto']

const takeDownReasonBodyDto = z.object({
  reason: z.string().trim().min(1).max(500).optional(),
}) satisfies z.ZodType<ContractTakeDownReason>

export type TakeDownReasonBodyDto = z.infer<typeof takeDownReasonBodyDto>

/**
 * Builds the outgoing body for a take-down/restore/revoke-sessions write. A blank or
 * whitespace-only reason is never sent as an empty string — the key is omitted entirely, which
 * is what `JSON.stringify` does with a `reason: undefined` property.
 */
export function buildTakeDownBody(reason?: string): TakeDownReasonBodyDto {
  const trimmed = reason?.trim()
  return takeDownReasonBodyDto.parse(trimmed ? { reason: trimmed } : {})
}

type ContractRevokeSessionsResult = ApiSchemas['AdminRevokeSessionsResultEntity']

export const revokeSessionsResultDto = z.object({
  revoked: z.number().int(),
}) satisfies z.ZodType<ContractRevokeSessionsResult>
