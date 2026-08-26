import { createReadStream } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { extname, join } from 'node:path'
import type { StorageService } from '@infra/storage/storage.types'
import { Logger } from '@nestjs/common'
import type { PreparedCmafPackage, PreparedVariant } from './audio-artifact.types'

/** Maximum number of storage writes started at once by one worker. */
const STORAGE_UPLOAD_CONCURRENCY = 6

/** Content types for the file extensions this pipeline produces. */
const CONTENT_TYPES: Record<string, string> = {
  '.opus': 'audio/ogg',
  '.m3u8': 'application/vnd.apple.mpegurl',
  '.mp4': 'video/mp4',
  '.m4a': 'audio/mp4',
  '.m4s': 'video/iso.segment',
}

const logger = new Logger('AudioArtifactStorage', { timestamp: true })

/** Everything one finished conversion needs to publish to storage. */
export type UploadArtifactsInput = {
  storage: StorageService
  generationRoot: string
  variants: PreparedVariant[]
  temporaryHlsPath: string
  cmafPackage: PreparedCmafPackage
}

/** Returns the MIME type for a file based on its extension. */
function contentTypeFor(filePath: string): string {
  return CONTENT_TYPES[extname(filePath).toLowerCase()] ?? 'application/octet-stream'
}

/** Runs asynchronous storage work without building an unbounded Promise fan-out. */
async function runWithConcurrency(
  tasks: Array<() => Promise<void>>,
  concurrency: number,
): Promise<void> {
  let nextIndex = 0

  const worker = async () => {
    while (nextIndex < tasks.length) {
      const task = tasks[nextIndex]
      nextIndex += 1
      await task?.()
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, tasks.length) }, async () => worker()),
  )
}

/** Recursively uploads all files in a local directory to a storage key prefix. */
async function uploadDirectory(
  storage: StorageService,
  localDir: string,
  keyPrefix: string,
): Promise<void> {
  const entries = await readdir(localDir, { withFileTypes: true })

  await runWithConcurrency(
    entries.map((entry) => async () => {
      const localPath = join(localDir, entry.name)
      if (entry.isDirectory()) {
        await uploadDirectory(storage, localPath, `${keyPrefix}/${entry.name}`)
        return
      }
      await storage.upload(
        `${keyPrefix}/${entry.name}`,
        createReadStream(localPath),
        contentTypeFor(localPath),
      )
    }),
    STORAGE_UPLOAD_CONCURRENCY,
  )
}

/**
 * Uploads the progressive Opus files, the aligned HLS tree, and the CMAF
 * renditions of one generation.
 *
 * Storage key structure (identical on both the S3 and local drivers):
 *   tracks/{trackId}/generations/{generation}/audio/{bitrate}k.opus
 *   tracks/{trackId}/generations/{generation}/hls/master.m3u8
 *   tracks/{trackId}/generations/{generation}/hls/{bitrate}/{asset}
 *   tracks/{trackId}/generations/{generation}/cmaf/{bitrate}.m4a
 *
 * The master playlist is written last: until it exists, a partially uploaded
 * generation cannot be played by mistake.
 */
export async function uploadArtifacts({
  storage,
  generationRoot,
  variants,
  temporaryHlsPath,
  cmafPackage,
}: UploadArtifactsInput): Promise<void> {
  const uploads: Array<() => Promise<void>> = [
    ...cmafPackage.renditions.map((rendition) => async () => {
      await storage.upload(
        rendition.audioKey,
        createReadStream(rendition.temporaryPath),
        'audio/mp4',
      )
    }),
    ...variants.map((variant) => async () => {
      await storage.upload(
        variant.audioKey,
        createReadStream(variant.temporaryAudioPath),
        'audio/ogg',
      )
    }),
  ]

  const hlsEntries = await readdir(temporaryHlsPath, { withFileTypes: true })
  for (const entry of hlsEntries) {
    if (!entry.isDirectory()) continue
    uploads.push(async () => {
      await uploadDirectory(
        storage,
        join(temporaryHlsPath, entry.name),
        `${generationRoot}/hls/${entry.name}`,
      )
    })
  }

  await runWithConcurrency(uploads, STORAGE_UPLOAD_CONCURRENCY)
  await storage.upload(
    `${generationRoot}/hls/master.m3u8`,
    createReadStream(join(temporaryHlsPath, 'master.m3u8')),
    'application/vnd.apple.mpegurl',
  )
  logger.log(`Uploaded all audio assets under ${generationRoot}`)
}
