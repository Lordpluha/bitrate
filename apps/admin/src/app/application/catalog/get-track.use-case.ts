import { inject, Injectable } from '@angular/core'
import { type TrackDetail, TrackRepository } from '@domain/track'

@Injectable({ providedIn: 'root' })
export class GetTrackUseCase {
  private readonly tracks = inject(TrackRepository)

  execute(id: string): Promise<TrackDetail> {
    return this.tracks.getById(id)
  }
}
