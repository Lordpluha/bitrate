import { randomUUID } from 'node:crypto'
import { IMAGE_EXTENSION_BY_MIME } from '@common/utils/image'
import { applyDecorators, BadRequestException, UseInterceptors } from '@nestjs/common'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'

import { uploadDestination } from './track-media'

/** Upload ceiling shared by the audio and cover parts of a track submission. */
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024

/** Audio uploads stay private; covers are served publicly. */

const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/webm']
const ALLOWED_COVER_TYPES = ['image/gif', 'image/jpeg', 'image/png', 'image/webp']

const AUDIO_EXTENSION_BY_MIME: Record<string, string> = {
  'audio/mpeg': '.mp3',
  'audio/ogg': '.ogg',
  'audio/wav': '.wav',
  'audio/webm': '.webm',
}

/** Chooses a server-owned extension so a client filename cannot control response MIME. */
function uploadExtension(file: Express.Multer.File): string {
  if (file.fieldname === 'audio') return AUDIO_EXTENSION_BY_MIME[file.mimetype] ?? ''
  return IMAGE_EXTENSION_BY_MIME[file.mimetype as keyof typeof IMAGE_EXTENSION_BY_MIME] ?? ''
}

/**
 * Accepts the `audio` + `cover` multipart pair of a track submission.
 *
 * Create and update take byte-identical uploads, so both routes share this one
 * definition rather than repeating the storage, filter, and naming rules.
 */
export const TrackFilesInterceptor = () =>
  applyDecorators(
    UseInterceptors(
      FileFieldsInterceptor(
        [
          { name: 'audio', maxCount: 1 },
          { name: 'cover', maxCount: 1 },
        ],
        {
          limits: { fileSize: MAX_UPLOAD_BYTES },
          storage: diskStorage({
            destination: (_req, file, cb) => cb(null, uploadDestination(file)),
            filename: (_req, file, cb) => cb(null, `${randomUUID()}${uploadExtension(file)}`),
          }),
          fileFilter: (_req, file, cb) => {
            if (file.fieldname === 'audio' && !ALLOWED_AUDIO_TYPES.includes(file.mimetype)) {
              return cb(new BadRequestException('Invalid audio file type'), false)
            }
            if (file.fieldname === 'cover' && !ALLOWED_COVER_TYPES.includes(file.mimetype)) {
              return cb(new BadRequestException('Invalid cover file type'), false)
            }
            cb(null, true)
          },
        },
      ),
    ),
  )
