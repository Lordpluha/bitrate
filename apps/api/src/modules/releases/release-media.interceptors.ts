import { randomUUID } from 'node:crypto'
import { getUploadTempDir } from '@modules/tracks/audio-scratch'
import { applyDecorators, BadRequestException, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage, memoryStorage } from 'multer'
import { RELEASE_ERRORS } from './errors'

/** Artwork ceiling; DSPs ask for 3000×3000 images, which stay well below this as JPEG/PNG. */
export const MAX_RELEASE_COVER_BYTES = 20 * 1024 * 1024

/** Master ceiling: a ten-minute 24-bit/96 kHz stereo WAV is about 350 MB. */
const MAX_RELEASE_AUDIO_BYTES = 512 * 1024 * 1024

const COVER_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/** Server-chosen extension per accepted master type, so a client file name never sets the MIME. */
export const RELEASE_AUDIO_EXTENSION_BY_MIME: Record<string, string> = {
  'audio/wav': '.wav',
  'audio/x-wav': '.wav',
  'audio/wave': '.wav',
  'audio/flac': '.flac',
  'audio/x-flac': '.flac',
  'audio/mpeg': '.mp3',
  'audio/ogg': '.ogg',
}

/** Accepts one in-memory `cover` image; content is checked against magic bytes by the service. */
export const ReleaseCoverInterceptor = () =>
  applyDecorators(
    UseInterceptors(
      FileInterceptor('cover', {
        limits: { fileSize: MAX_RELEASE_COVER_BYTES, files: 1 },
        storage: memoryStorage(),
        fileFilter: (_req, file, cb) => {
          if (!COVER_TYPES.includes(file.mimetype)) {
            return cb(new BadRequestException(RELEASE_ERRORS.COVER_TYPE_INVALID), false)
          }
          cb(null, true)
        },
      }),
    ),
  )

/**
 * Accepts one `audio` master, streamed to the private upload directory rather than memory; the
 * service moves it into STORAGE_SERVICE and always removes the temporary file.
 */
export const ReleaseAudioInterceptor = () =>
  applyDecorators(
    UseInterceptors(
      FileInterceptor('audio', {
        limits: { fileSize: MAX_RELEASE_AUDIO_BYTES, files: 1 },
        storage: diskStorage({
          destination: (_req, _file, cb) => {
            try {
              cb(null, getUploadTempDir())
            } catch (error) {
              cb(error as Error, '')
            }
          },
          filename: (_req, file, cb) =>
            cb(null, `${randomUUID()}${RELEASE_AUDIO_EXTENSION_BY_MIME[file.mimetype] ?? ''}`),
        }),
        fileFilter: (_req, file, cb) => {
          if (!(file.mimetype in RELEASE_AUDIO_EXTENSION_BY_MIME)) {
            return cb(new BadRequestException(RELEASE_ERRORS.AUDIO_TYPE_INVALID), false)
          }
          cb(null, true)
        },
      }),
    ),
  )
