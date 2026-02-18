import { statSync } from 'node:fs'
import { basename, extname } from 'node:path'
import { Readable } from 'node:stream'

/**
 * Создает объект, совместимый с Express.Multer.File
 * для использования с существующими методами TracksService
 */
export function createMulterFileFromPath(
  filePath: string,
  fieldname: 'audio' | 'cover',
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
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
  }

  const mimetype = mimeTypes[ext] || 'application/octet-stream'

  // Создаем объект, совместимый с Express.Multer.File
  return {
    fieldname,
    originalname: filename,
    encoding: '7bit',
    mimetype,
    size: stats.size,
    filename,
    path: filePath,
    destination: '',
    buffer: Buffer.from([]), // Пустой буфер, так как используем path
    stream: new Readable(),
  }
}
