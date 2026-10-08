import { HttpException, type HttpStatus } from '@nestjs/common'

/**
 * Base for module `errors/` classes whose message is a dictionary key.
 *
 * Carries the key (`errors.<area>.<name>`), the interpolation args for `{placeholders}` in the
 * dictionary text, and the HTTP status. The `HttpExceptionFilter` translates the key into the
 * request locale and echoes it back as the body's `code`, so a service stays ignorant of locale
 * and clients can tell errors apart without parsing text.
 *
 * @example
 * class TrackGoneException extends TranslatableException {
 *   constructor(id: string) {
 *     super('errors.track.not_found', HttpStatus.GONE, { id })
 *   }
 * }
 */
export class TranslatableException extends HttpException {
  /** The dictionary key, also the response `code`. */
  readonly key: string

  /** Creates a keyed exception. */
  constructor(key: string, status: HttpStatus, args: Record<string, unknown> = {}) {
    super({ message: key, args }, status)
    this.key = key
  }
}
