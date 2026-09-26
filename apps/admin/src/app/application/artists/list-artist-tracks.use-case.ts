import { inject, Injectable } from '@angular/core'
import { type ArtistTrack, ArtistRepository } from '@domain/artist'
import type { Page } from '@domain/shared'

export type ListArtistTracksInput = {
  artistId: string
  page: number
}

@Injectable({ providedIn: 'root' })
export class ListArtistTracksUseCase {
  private readonly artists = inject(ArtistRepository)

  execute({ artistId, page }: ListArtistTracksInput): Promise<Page<ArtistTrack>> {
    return this.artists.listTracks(artistId, page)
  }
}
