import { randomUUID } from 'node:crypto'
import { applyDecorators, BadRequestException, UseInterceptors } from '@nestjs/common'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import { diskStorage, memoryStorage, type StorageEngine } from 'multer'
import { getUploadTempDir } from './audio-scratch'

/** Upload ceiling shared by the audio and cover parts of a track submission. */
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024

const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/webm']
const ALLOWED_COVER_TYPES = ['image/gif', 'image/jpeg', 'image/png', 'image/webp']

const AUDIO_EXTENSION_BY_MIME: Record<string, string> = {
  'audio/mpeg': '.mp3',
  'audio/ogg': '.ogg',
  'audio/wav': '.wav',
  'audio/webm': '.webm',
}

/** Chooses a server-owned extension so a client filename cannot control response MIME. */
function audioExtension(file: Express.Multer.File): string {
  return AUDIO_EXTENSION_BY_MIME[file.mimetype] ?? ''
}

/**
 * Multer engine for a track submission. Audio streams to a private temporary directory (it is
 * large, and the master is then moved into STORAGE_SERVICE); a cover is held in memory and
 * uploaded to STORAGE_SERVICE by the service, so no image is ever written to local disk.
 */
function createTrackUploadStorage(): StorageEngine {
  const audio = diskStorage({
    destination: (_req, _file, cb) => {
      try {
        cb(null, getUploadTempDir())
      } catch (error) {
        cb(error as Error, '')
      }
    },
    filename: (_req, file, cb) => cb(null, `${randomUUID()}${audioExtension(file)}`),
  })
  const cover = memoryStorage()
  const engineFor = (file: Express.Multer.File) => (file.fieldname === 'audio' ? audio : cover)

  return {
    _handleFile: (req, file, cb) => engineFor(file)._handleFile(req, file, cb),
    _removeFile: (req, file, cb) => engineFor(file)._removeFile(req, file, cb),
  }
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
          storage: createTrackUploadStorage(),
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
