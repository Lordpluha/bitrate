import type { ApiSchemas } from '@bitrate/contracts'
import * as z from 'zod'
import type { BatchResult } from '@domain/shared'
import { contractEnum } from './contract-union'

type ContractBatchResult = ApiSchemas['AdminBatchResultEntity']
type ContractBatchItem = ApiSchemas['AdminBatchItemResultEntity']

const batchItemStatusDto = contractEnum<ContractBatchItem['status']>()(['succeeded', 'failed'])

/** The response every `POST /admin/<resource>/batch/<action>` answers with. Shared across resources. */
export const batchResultDto = z.object({
  results: z.array(
    z.object({
      id: z.string(),
      status: batchItemStatusDto,
      error: z.object({ code: z.string(), message: z.string() }).optional(),
    }),
  ),
  total: z.number().int(),
  succeeded: z.number().int(),
  failed: z.number().int(),
}) satisfies z.ZodType<ContractBatchResult>

export type BatchResultDto = z.infer<typeof batchResultDto>

/** The request body of every batch route, bound to the contract's `BatchIdsDto`. */
export function buildBatchBody(ids: readonly string[]): ApiSchemas['BatchIdsDto'] {
  return { ids: [...ids] }
}

/** Maps the wire result to the domain's — `status` becomes `outcome`, `error` becomes `failure`. */
export function toBatchResult(dto: BatchResultDto): BatchResult {
  return {
    items: dto.results.map((item) => ({
      id: item.id,
      outcome: item.status,
      ...(item.error ? { failure: { code: item.error.code, message: item.error.message } } : {}),
    })),
    succeeded: dto.succeeded,
    failed: dto.failed,
  }
}
