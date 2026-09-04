import { basename, dirname, join } from 'node:path'
import { BadRequestException } from '@nestjs/common'

/**
 * Reconstructs a Multer-uploaded file's on-disk path from its own directory and
 * generated filename, rejecting any filename that would escape that directory.
 *
 * Every `diskStorage` `filename` callback in this codebase derives the stored name
 * from `randomUUID()` plus a server-owned extension, so `file.filename` never
 * actually contains a path separator — this makes that guarantee local and
 * checkable at the point a Multer file's path is opened or removed, instead of
 * trusting `file.path` as an opaque string.
 *
 * @throws BadRequestException when the generated filename would escape its directory.
 */
export function resolveSafeMulterPath(file: Express.Multer.File): string {
  const safeName = basename(file.filename)

  if (safeName !== file.filename) {
    throw new BadRequestException('Invalid uploaded file name')
  }

  // `safeName`, not `file.filename` — the two are equal by the check above, but joining the
  // result of `basename()` is what makes the sanitisation visible to a reader and to static
  // analysis. Comparing against it and then using the original leaves the taint intact.
  return join(dirname(file.path), safeName)
}
