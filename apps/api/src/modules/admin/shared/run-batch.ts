import { HttpException, HttpStatus, Logger } from '@nestjs/common'

/**
 * Plain shapes of `AdminBatchResultEntity`, not the class itself: the Swagger compiler plugin
 * turns a class in a controller's inferred return type into an absolute `require()` of its
 * source, which breaks the emitted JS in checkouts whose path it cannot relativize. The
 * response schema comes from the route decorators, which still reference the entity.
 */
type BatchItemError = { code: string; message: string }
type BatchResult = {
  results: { id: string; status: 'succeeded' | 'failed'; error?: BatchItemError }[]
  total: number
  succeeded: number
  failed: number
}

const logger = new Logger('AdminBatch')

const toItemError = (error: unknown): BatchItemError => {
  if (error instanceof HttpException) {
    const status = error.getStatus()
    return { code: HttpStatus[status] ?? String(status), message: error.message }
  }
  // Never leak internals into a 200 body; the full error goes to the log.
  logger.error('Batch item failed unexpectedly', error)
  return { code: 'INTERNAL_SERVER_ERROR', message: 'Unexpected error' }
}

/**
 * Runs `apply` once per distinct id, sequentially, each independent of the others — one id's
 * failure never stops or rolls back another. `apply` is the same service method the
 * single-entity route calls, so rules, 404/409 semantics and side effects stay identical.
 */
export async function runBatch(
  ids: readonly string[],
  apply: (id: string) => Promise<unknown>,
): Promise<BatchResult> {
  const results: BatchResult['results'] = []
  for (const id of new Set(ids)) {
    try {
      await apply(id)
      results.push({ id, status: 'succeeded' })
    } catch (error) {
      results.push({ id, status: 'failed', error: toItemError(error) })
    }
  }
  const succeeded = results.filter((result) => result.status === 'succeeded').length
  return { results, total: results.length, succeeded, failed: results.length - succeeded }
}
