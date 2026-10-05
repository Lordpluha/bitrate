import { statSync } from 'node:fs'
import { basename, extname } from 'node:path'
import { Readable } from 'node:stream'
import { detectAllowedImageMime } from '@common/utils/image'

/** Common fields of the Multer file objects the seeds hand to `TrackUploadService`. */
function multerFile(
  fieldname: 'audio' | 'cover',
  originalname: string,
  mimetype: string,
  size: number,
): Express.Multer.File {
  return {
    fieldname,
    originalname,
    encoding: '7bit',
    mimetype,
    size,
    destination: '',
    stream: new Readable(),
  } as Express.Multer.File
}

/**
 * Создает объект, совместимый с Express.Multer.File, для аудиофайла,
 * который лежит в приватной рабочей директории (`getUploadTempDir`).
 */
export function createMulterFileFromPath(
  filePath: string,
  fieldname: 'audio',
): Express.Multer.File {
  const stats = statSync(filePath)
  const filename = basename(filePath)
  const ext = extname(filePath).toLowerCase()

  // Определяем mimetype на основе расширения
  const mimeTypes: Record<string, string> = {
    '.mp3': 'audio/mpeg',
    '.ogg': 'audio/ogg',
    '.opus': 'audio/ogg',
    '.wav': 'audio/wav',
    '.webm': 'audio/webm',
  }

  return {
    ...multerFile(fieldname, filename, mimeTypes[ext] || 'application/octet-stream', stats.size),
    filename,
    path: filePath,
    buffer: Buffer.from([]), // Пустой буфер, так как используем path
  }
}

/**
 * Создает объект, совместимый с Express.Multer.File, для обложки в памяти — как это делает
 * Multer `memoryStorage` в контроллере. MIME берётся из байтов, а не из расширения, поэтому
 * загрузка всё равно проверяет содержимое.
 */
export function createMulterFileFromBuffer(
  buffer: Buffer,
  fieldname: 'cover',
): Express.Multer.File {
  const mimetype = detectAllowedImageMime(buffer) ?? 'application/octet-stream'
  return { ...multerFile(fieldname, 'cover', mimetype, buffer.length), buffer }
}
