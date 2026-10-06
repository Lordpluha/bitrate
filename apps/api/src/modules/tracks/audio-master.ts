import { createReadStream, createWriteStream } from 'node:fs'
import { mkdir, rm } from 'node:fs/promises'
import { dirname } from 'node:path'
import { pipeline } from 'node:stream/promises'
import type { StorageService } from '@infra/storage/storage.types'

/** Everything needed to move an uploaded master from a temporary file into storage. */
export type StoreMasterInput = {
  storage: StorageService
  key: string
  filePath: string
  contentType: string
}

/**
 * Uploads a master from a temporary file and removes the file once storage holds it.
 *
 * A file stream is passed rather than an arbitrary Readable: the S3 driver needs a known
 * content length, which a file stream (or Buffer) provides. On failure the file is kept so
 * the caller's cleanup path stays the single owner of removing it.
 */
export async function storeMaster({
  storage,
  key,
  filePath,
  contentType,
}: StoreMasterInput): Promise<void> {
  await storage.upload(key, createReadStream(filePath), contentType)
  await rm(filePath, { force: true })
}

/** Downloads an object from storage into a local file, creating parent directories. */
export async function downloadObjectToFile(
  storage: StorageService,
  key: string,
  destinationPath: string,
): Promise<void> {
  await mkdir(dirname(destinationPath), { recursive: true })
  const { stream } = await storage.getObjectStream(key)
  await pipeline(stream, createWriteStream(destinationPath))
}
