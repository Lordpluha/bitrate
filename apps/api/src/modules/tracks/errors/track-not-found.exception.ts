import { NotFoundException } from '@nestjs/common'

/**
 * Thrown when a track lookup by id finds nothing. Carries the `errors.track.not_found`
 * dictionary key plus the interpolation args the `HttpExceptionFilter` needs to translate
 * it — the service knows nothing about locale, only that the track is missing.
 */
export class TrackNotFoundException extends NotFoundException {
  constructor(id: string) {
    super({ message: 'errors.track.not_found', args: { id } })
  }
}
