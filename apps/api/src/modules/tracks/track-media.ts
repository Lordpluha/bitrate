import { open, rm } from 'node:fs/promises'
import { basename } from 'node:path'
import { detectAllowedImageMime } from '@common/utils/image'
import { BadRequestException, Logger } from '@nestjs/common'
import { parseFile } from 'music-metadata'
import { MAX_COVER_BYTES } from './track-audio.helpers'

/** Bytes of an image header needed to recognise every allowed cover format. */
const IMAGE_MAGIC_BYTES = 12

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
 * Verifies that a cover's declared MIME matches its actual magic bytes.
 *
 * @throws BadRequestException when the cover is oversized or misdeclared.
 */
export async function validateCoverFile(file: Express.Multer.File): Promise<void> {
  if (file.size > MAX_COVER_BYTES) throw new BadRequestException('Cover file is too large')

  const header = Buffer.alloc(IMAGE_MAGIC_BYTES)
  const handle = await open(file.path, 'r')
  try {
    await handle.read(header, 0, header.length, 0)
  } finally {
    await handle.close()
  }

  if (detectAllowedImageMime(header) !== file.mimetype) {
    throw new BadRequestException('Invalid cover file content')
  }
}

/** Removes files written by Multer before the database took ownership of them. */
export async function cleanupUploadedFiles(
  files: Array<Express.Multer.File | undefined>,
): Promise<void> {
  await Promise.all(files.flatMap((file) => (file ? [rm(file.path, { force: true })] : [])))
}

/**
 * Deletes an old managed file, refusing any stored name that would escape its root.
 *
 * Failure to delete is logged rather than thrown: the database already points at
 * the replacement, so a leftover file is waste, not a broken track.
 */
export async function removeReplacedFile(path: string, fileName: string | null): Promise<void> {
  if (!(fileName && basename(fileName) === fileName)) return

  try {
    await rm(path, { force: true })
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'unknown error'
    logger.warn(`Unable to remove replaced media file ${fileName}: ${reason}`)
  }
}
