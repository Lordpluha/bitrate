import { inject, Injectable } from '@angular/core'
import { DEFAULT_PAGE_SIZE, type Page } from '@domain/shared'
import { type Track, type TrackFilter, TrackRepository } from '@domain/track'

export type ListTracksInput = {
  page: number
  filter?: TrackFilter
}

@Injectable({ providedIn: 'root' })
export class ListTracksUseCase {
  private readonly tracks = inject(TrackRepository)

  /** The API sorts failed and long-running uploads first — this screen exists for those. */
  execute({ page, filter = {} }: ListTracksInput): Promise<Page<Track>> {
    return this.tracks.list({ page, limit: DEFAULT_PAGE_SIZE, filter })
  }
}
