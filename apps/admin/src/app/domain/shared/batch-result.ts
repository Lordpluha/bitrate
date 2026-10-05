/** The most ids one batch request may name — the API rejects more, so the UI never builds more. */
export const MAX_BATCH_SIZE = 100

/** Why one row of a batch failed, in the API's own words. */
type BatchItemFailure = {
  code: string
  message: string
}

/** What happened to one row of a batch. */
type BatchItemResult = {
  id: string
  outcome: 'succeeded' | 'failed'
  /** Present only when `outcome` is `failed`. */
  failure?: BatchItemFailure
}

/**
 * The per-row outcome of a batch action. A batch is never all-or-nothing: some rows can succeed
 * while others fail, and the operator is shown which.
 */
export type BatchResult = {
  items: BatchItemResult[]
  succeeded: number
  failed: number
}
