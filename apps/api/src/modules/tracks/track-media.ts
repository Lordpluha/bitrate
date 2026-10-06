import { rm } from 'node:fs/promises'
import { resolveSafeMulterPath } from '@common/utils/multer-file'
import { BadRequestException, Logger } from '@nestjs/common'
import { parseFile } from 'music-metadata'
import { getUploadTempDir } from './audio-scratch'

const logger = new Logger('TrackMedia', { timestamp: true })

/** What probing an uploaded audio file reveals about it. */
export type AudioMetadata = {
  bitrate: number
  duration: number | null
  codec: string | null
  container: string | null
}

/**
 * Reads audio metadata from the file at `filePath`.
 *
 * Duration is taken from the file itself rather than supplied by the caller, so
 * a track's stored length always matches the audio a listener actually hears.
 *
 * @throws BadRequestException when the file cannot be parsed as audio.
 */
export async function inspectAudioFile(filePath: string): Promise<AudioMetadata> {
  try {
    const { format } = await parseFile(filePath)

    return {
      bitrate: format.bitrate ? Math.max(1, Math.round(format.bitrate / 1000)) : 0,
      duration: format.duration ? Math.max(1, Math.round(format.duration)) : null,
      codec: format.codec ?? null,
      container: format.container?.toLowerCase() ?? null,
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Unknown error'
    logger.warn(`Unable to inspect audio metadata: ${reason}`)
    throw new BadRequestException('Invalid or unreadable audio file')
  }
}

/**
 * Removes the audio file Multer wrote to the private upload directory, for an upload the
 * database never took ownership of. Covers are held in memory and need no cleanup.
 */
export async function cleanupUploadedAudio(file: Express.Multer.File | undefined): Promise<void> {
  if (!file?.filename) return
  await rm(resolveSafeMulterPath(file, getUploadTempDir()), { force: true })
}
