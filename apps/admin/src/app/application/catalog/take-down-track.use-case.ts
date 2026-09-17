import { inject, Injectable } from '@angular/core'
import { ActionNotAllowedError } from '@domain/shared'
import { canTakeDownTrack, type Track, TrackRepository } from '@domain/track'

export type TakeDownTrackInput = {
  track: Track
  reason?: string
}

@Injectable({ providedIn: 'root' })
export class TakeDownTrackUseCase {
  private readonly tracks = inject(TrackRepository)

  /**
   * @throws {ActionNotAllowedError} When the track is already taken down.
   */
  async execute({ track, reason }: TakeDownTrackInput): Promise<void> {
    const decision = canTakeDownTrack(track)
    if (!decision.allowed) {
      throw new ActionNotAllowedError(decision.reason)
    }

    await this.tracks.takeDown({ id: track.id, reason })
  }
}
