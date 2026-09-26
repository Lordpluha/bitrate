import { inject, Injectable } from '@angular/core'
import { ActionNotAllowedError } from '@domain/shared'
import { canReprocess, type Track, TrackRepository } from '@domain/track'

@Injectable({ providedIn: 'root' })
export class ReprocessTrackUseCase {
  private readonly tracks = inject(TrackRepository)

  /**
   * @throws {ActionNotAllowedError} When the track already finished processing.
   */
  async execute(track: Track): Promise<void> {
    if (!canReprocess(track)) {
      throw new ActionNotAllowedError(`"${track.title}" has already finished processing.`)
    }

    await this.tracks.reprocess(track.id)
  }
}
