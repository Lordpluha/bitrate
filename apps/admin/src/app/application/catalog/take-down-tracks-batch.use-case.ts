import { inject, Injectable } from '@angular/core'
import { ActionNotAllowedError, type BatchResult, MAX_BATCH_SIZE } from '@domain/shared'
import { canTakeDownTrack, type Track, TrackRepository } from '@domain/track'

@Injectable({ providedIn: 'root' })
export class TakeDownTracksBatchUseCase {
  private readonly tracks = inject(TrackRepository)

  /**
   * @throws {ActionNotAllowedError} When nothing is selected, too many rows are, or any track is
   *   already taken down — the batch is refused before any request is made.
   */
  execute(tracks: readonly Track[]): Promise<BatchResult> {
    if (tracks.length === 0 || tracks.length > MAX_BATCH_SIZE) {
      throw new ActionNotAllowedError(`Select between 1 and ${MAX_BATCH_SIZE} tracks.`)
    }
    for (const track of tracks) {
      const decision = canTakeDownTrack(track)
      if (!decision.allowed) throw new ActionNotAllowedError(decision.reason)
    }

    return this.tracks.takeDownMany(tracks.map((track) => track.id))
  }
}
