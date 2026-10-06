import { randomUUID } from 'node:crypto'
import {
  type AllowedImageMime,
  detectAllowedImageMime,
  IMAGE_EXTENSION_BY_MIME,
} from '@common/utils/image'
import { BadRequestException, Logger } from '@nestjs/common'
import type { StorageService } from './storage.types'

/**
 * Folders that hold public images. The folder is also the first part of the `/static/<folder>/...`
 * URL clients already build, so a stored value keeps working unchanged (ADR-0050).
 */
export const PUBLIC_IMAGE_FOLDERS = [
  'tracks/covers',
  'albums/covers',
  'playlists/covers',
  'artists/avatars',
  'artists/backgrounds',
  'users/avatars',
] as const

/** A folder public images are stored under. */
export type PublicImageFolder = (typeof PUBLIC_IMAGE_FOLDERS)[number]

/** Bytes of an image header needed to recognise every allowed format. */
const IMAGE_MAGIC_BYTES = 12

/** One plain file name: no separators, no leading dot, an allow-listed image extension. */
const FILE_NAME_PATTERN = /^[A-Za-z0-9_][A-Za-z0-9._-]*\.(?:gif|jpe?g|png|webp)$/i

const logger = new Logger('PublicImages', { timestamp: true })

/** Whether `key` is exactly `<public folder>/<plain image file name>`. */
export function isPublicAssetKey(key: string): boolean {
  const separator = key.lastIndexOf('/')
  if (separator < 1) return false
  const folder = key.slice(0, separator)
  const name = key.slice(separator + 1)
  return (
    (PUBLIC_IMAGE_FOLDERS as readonly string[]).includes(folder) &&
    FILE_NAME_PATTERN.test(name) &&
    !name.includes('..')
  )
}

/** Options for {@link storePublicImage}. */
export type StorePublicImageOptions = {
  /** Largest accepted image in bytes. */
  maxBytes?: number
}

/**
 * Checks an in-memory image upload without storing it: the size ceiling and the declared MIME
 * type against the file's magic bytes.
 *
 * @returns The detected, allow-listed MIME type.
 * @throws BadRequestException when the image is oversized or misdeclared.
 */
export function validatePublicImage(
  file: Express.Multer.File,
  { maxBytes }: StorePublicImageOptions = {},
): AllowedImageMime {
  if (maxBytes !== undefined && file.size > maxBytes) {
    throw new BadRequestException('Image file is too large')
  }
  const detected = detectAllowedImageMime(file.buffer.subarray(0, IMAGE_MAGIC_BYTES))
  if (!detected || detected !== file.mimetype) {
    throw new BadRequestException('Invalid image file content')
  }
  return detected
}

/**
 * Validates an in-memory image upload and stores it in `STORAGE_SERVICE`.
 *
 * The object name is generated here (a UUID plus a server-chosen extension), so nothing from the
 * request reaches the key.
 *
 * @returns The generated file name, which is what the database stores.
 * @throws BadRequestException when the image is oversized or misdeclared.
 */
export async function storePublicImage(
  storage: StorageService,
  folder: PublicImageFolder,
  file: Express.Multer.File,
  options: StorePublicImageOptions = {},
): Promise<string> {
  const mime = validatePublicImage(file, options)
  const name = `${randomUUID()}${IMAGE_EXTENSION_BY_MIME[mime]}`
  await storage.upload(`${folder}/${name}`, file.buffer, mime)
  return name
}

/** Best-effort removal of a stored public image; a leftover object is waste, not an error. */
export async function removePublicImage(
  storage: StorageService,
  folder: PublicImageFolder,
  name: string | null | undefined,
): Promise<void> {
  if (!(name && FILE_NAME_PATTERN.test(name))) return
  try {
    await storage.deleteObject(`${folder}/${name}`)
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'unknown error'
    logger.warn(`Unable to remove public image ${folder}/${name}: ${reason}`)
  }
}
