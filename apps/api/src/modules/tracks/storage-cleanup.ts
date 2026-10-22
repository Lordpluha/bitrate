import type { StorageService } from '@infra/storage/storage.types'
import type { Logger } from '@nestjs/common'

/**
 * Best-effort removal of a private object nothing points at any more. An orphaned object is
 * waste, never a failed request, so a storage error is only logged.
 */
export async function deleteObjectQuietly(
  storage: StorageService,
  key: string,
  logger: Logger,
): Promise<void> {
  try {
    await storage.deleteObject(key)
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'unknown error'
    logger.warn(`Unable to remove orphaned object ${key}: ${reason}`)
  }
}
