import { basename, join } from 'node:path'
import { BadRequestException } from '@nestjs/common'

/**
 * Builds the on-disk path of a Multer upload from a server-owned directory and the file's
 * generated name, rejecting any name that would escape that directory.
 *
 * The directory is a caller-supplied constant rather than `dirname(file.path)`: everything on the
 * uploaded-file object arrived with the request, so deriving the directory from it would put a
 * client-influenced value in the path even though Multer wrote it. Here neither half comes from
 * the request — the directory is a literal the server chose, and the name is the result of
 * `basename()`.
 *
 * @throws BadRequestException when the generated filename would escape its directory.
 */
export function resolveSafeMulterPath(file: Express.Multer.File, directory: string): string {
  const safeName = basename(file.filename)

  if (safeName !== file.filename) {
    throw new BadRequestException('Invalid uploaded file name')
  }

  return join(directory, safeName)
}
