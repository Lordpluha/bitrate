import { inject, Injectable } from '@angular/core'
import { ActionNotAllowedError } from '@domain/shared'
import { canRestoreTrack, type Track, TrackRepository } from '@domain/track'

export type RestoreTrackInput = {
  track: Track
  reason?: string
}

@Injectable({ providedIn: 'root' })
export class RestoreTrackUseCase {
  private readonly tracks = inject(TrackRepository)

  /**
   * @throws {ActionNotAllowedError} When the track is not taken down.
   */
  async execute({ track, reason }: RestoreTrackInput): Promise<void> {
    const decision = canRestoreTrack(track)
    if (!decision.allowed) {
      throw new ActionNotAllowedError(decision.reason)
    }

    await this.tracks.restore({ id: track.id, reason })
  }
}
