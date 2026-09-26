import { inject, Injectable } from '@angular/core'
import { type ProbeTrackAudioInput, type TrackAudioSource, TrackRepository } from '@domain/track'

@Injectable({ providedIn: 'root' })
export class PrepareTrackAudioUseCase {
  private readonly tracks = inject(TrackRepository)

  execute(input: ProbeTrackAudioInput): Promise<TrackAudioSource> {
    return this.tracks.probeAudio(input)
  }
}
