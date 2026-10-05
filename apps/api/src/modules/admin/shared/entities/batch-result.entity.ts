import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

/** Why one id in a batch failed. */
export class AdminBatchItemErrorEntity {
  /** Stable machine-readable code, derived from the HTTP status the single-entity route would answer. */
  @ApiProperty({ example: 'NOT_FOUND' })
  code: string

  /** Human-readable reason, the same message the single-entity route would return. */
  @ApiProperty()
  message: string
}

/** The outcome for one id in a batch. */
export class AdminBatchItemResultEntity {
  @ApiProperty({ format: 'uuid' })
  id: string

  @ApiProperty({ enum: ['succeeded', 'failed'] })
  status: 'succeeded' | 'failed'

  /** Present only when `status` is `failed`. */
  @ApiPropertyOptional({ type: AdminBatchItemErrorEntity })
  error?: AdminBatchItemErrorEntity
}

/** Per-id results of a batch action, in request order, plus totals. Always HTTP 200. */
export class AdminBatchResultEntity {
  @ApiProperty({ type: [AdminBatchItemResultEntity] })
  results: AdminBatchItemResultEntity[]

  /** Distinct ids processed. */
  @ApiProperty()
  total: number

  @ApiProperty()
  succeeded: number

  @ApiProperty()
  failed: number
}
